const redisClient = require("../../config/redis");
const userRepository = require("../../repositories/UserRepository");

class LeaderboardService {
  constructor() {
    this.LEADERBOARD_KEY = "leaderboard:global";
  }

  async updateUserScore(userId, increment = 1) {
    try {
      if (!userId) return;
      await redisClient.zIncrBy(this.LEADERBOARD_KEY, increment, userId.toString());
    } catch (err) {
      console.error("Leaderboard Redis Update Error:", err.message);
    }
  }

  async getGlobalLeaderboard(page = 1, limit = 20) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const start = (pageNum - 1) * limitNum;
    const stop = start + limitNum - 1;

    try {
      const totalEntries = await redisClient.zCard(this.LEADERBOARD_KEY);
      if (totalEntries === 0) {
        await this.syncLeaderboardFromDB();
      }

      const topUserScores = await redisClient.zRangeWithScores(this.LEADERBOARD_KEY, start, stop, {
        REV: true,
      });

      if (!topUserScores || topUserScores.length === 0) {
        return { page: pageNum, limit: limitNum, total: 0, leaderboard: [] };
      }

      const userIds = topUserScores.map((item) => item.value);
      const users = await userRepository.find({ _id: { $in: userIds } });

      const userMap = new Map();
      users.forEach((u) => {
        userMap.set(u._id.toString(), {
          userId: u._id,
          firstName: u.firstName,
          lastName: u.lastName,
          emailId: u.emailId,
        });
      });

      const leaderboard = topUserScores.map((item, index) => {
        const userInfo = userMap.get(item.value) || { userId: item.value, firstName: "Anonymous" };
        return {
          rank: start + index + 1,
          ...userInfo,
          score: item.score,
        };
      });

      const count = await redisClient.zCard(this.LEADERBOARD_KEY);

      return {
        page: pageNum,
        limit: limitNum,
        total: count,
        leaderboard,
      };
    } catch (err) {
      console.error("Leaderboard Retrieval Error:", err.message);
      return await this.getFallbackLeaderboardFromDB(pageNum, limitNum);
    }
  }

  async getUserRank(userId) {
    try {
      const rank = await redisClient.zRevRank(this.LEADERBOARD_KEY, userId.toString());
      const score = await redisClient.zScore(this.LEADERBOARD_KEY, userId.toString());

      if (rank === null || rank === undefined) {
        return { rank: null, score: 0 };
      }

      return {
        rank: rank + 1,
        score: score ? parseFloat(score) : 0,
      };
    } catch (err) {
      console.error("Get User Rank Error:", err.message);
      return { rank: null, score: 0 };
    }
  }

  async syncLeaderboardFromDB() {
    try {
      const users = await userRepository.find({}, "firstName lastName problemSolved");
      for (const user of users) {
        const score = user.problemSolved ? user.problemSolved.length : 0;
        if (score > 0) {
          await redisClient.zAdd(this.LEADERBOARD_KEY, {
            score,
            value: user._id.toString(),
          });
        }
      }
      console.log("Redis Leaderboard synchronized with MongoDB.");
    } catch (err) {
      console.error("Leaderboard Cold-Start Sync Error:", err.message);
    }
  }

  async getFallbackLeaderboardFromDB(page, limit) {
    const skip = (page - 1) * limit;
    const users = await userRepository.find({}, "firstName lastName emailId problemSolved");

    const sorted = users
      .map((u) => ({
        userId: u._id,
        firstName: u.firstName,
        lastName: u.lastName,
        emailId: u.emailId,
        score: u.problemSolved ? u.problemSolved.length : 0,
      }))
      .sort((a, b) => b.score - a.score);

    const paginated = sorted.slice(skip, skip + limit).map((u, i) => ({
      rank: skip + i + 1,
      ...u,
    }));

    return {
      page,
      limit,
      total: sorted.length,
      leaderboard: paginated,
    };
  }
}

module.exports = new LeaderboardService();
