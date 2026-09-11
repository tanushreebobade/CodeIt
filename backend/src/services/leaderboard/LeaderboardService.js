const redisClient = require("../../config/redis");
const userRepository = require("../../repositories/UserRepository");

class LeaderboardService {
  constructor() {
    this.LEADERBOARD_KEY = "leaderboard:global";
  }

  isRedisConnected() {
    return redisClient && redisClient.isOpen;
  }

  async updateUserScore(userId, increment = 1) {
    if (!userId) return;
    try {
      if (this.isRedisConnected()) {
        await redisClient.zIncrBy(this.LEADERBOARD_KEY, increment, userId.toString());
      }
    } catch (err) {
      console.error("Leaderboard Redis Update Error:", err.message);
    }
  }

  // Fetch all registered users directly from DB, rank by points and solved problems count
  async getAllRankedUsersFromDB() {
    const rawUsers = await userRepository.find({}, "firstName lastName emailId problemSolved role createdAt");

    const users = (rawUsers || []).map((u) => {
      const solvedList = Array.isArray(u.problemSolved) ? u.problemSolved : [];

      let points = 0;
      solvedList.forEach((p) => {
        if (typeof p === "object" && p !== null && p.difficulty) {
          const diff = String(p.difficulty).toLowerCase();
          if (diff === "easy") points += 10;
          else if (diff === "medium") points += 20;
          else if (diff === "hard") points += 30;
          else points += 10;
        } else {
          points += 10;
        }
      });

      return {
        userId: u._id,
        firstName: u.firstName || "Coder",
        lastName: u.lastName || "",
        emailId: u.emailId || "",
        score: solvedList.length,
        solvedCount: solvedList.length,
        points: points,
        role: u.role || "user",
        createdAt: u.createdAt || new Date().toISOString(),
      };
    });

    // Sort by points descending (highest points first). If tie, sort by score then registration time
    users.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

    return users;
  }

  async getGlobalLeaderboard(page = 1, limit = 50) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 50);
    const skip = (pageNum - 1) * limitNum;

    try {
      // 100% Database-driven: Read all registered users directly from DB
      const allUsers = await this.getAllRankedUsersFromDB();

      const paginated = allUsers.slice(skip, skip + limitNum).map((u, i) => ({
        rank: skip + i + 1,
        ...u,
      }));

      return {
        page: pageNum,
        limit: limitNum,
        total: allUsers.length,
        leaderboard: paginated,
      };
    } catch (err) {
      console.error("Leaderboard DB Fetch Error:", err.message);
      return {
        page: pageNum,
        limit: limitNum,
        total: 0,
        leaderboard: [],
      };
    }
  }

  async getUserRank(userId) {
    if (!userId) return { rank: null, score: 0, points: 0 };

    try {
      const allUsers = await this.getAllRankedUsersFromDB();
      const index = allUsers.findIndex((u) => String(u.userId) === String(userId));
      if (index !== -1) {
        return {
          rank: index + 1,
          score: allUsers[index].score,
          points: allUsers[index].points,
        };
      }
      return { rank: null, score: 0, points: 0 };
    } catch (e) {
      console.error("Get User Rank Error:", e.message);
      return { rank: null, score: 0, points: 0 };
    }
  }

  async syncLeaderboardFromDB() {
    if (!this.isRedisConnected()) return;
    try {
      const users = await userRepository.find({}, "firstName lastName problemSolved");
      for (const user of users) {
        const score = Array.isArray(user.problemSolved) ? user.problemSolved.length : 0;
        await redisClient.zAdd(this.LEADERBOARD_KEY, {
          score,
          value: user._id.toString(),
        });
      }
    } catch (err) {
      console.error("Leaderboard Sync Error:", err.message);
    }
  }
}

module.exports = new LeaderboardService();
