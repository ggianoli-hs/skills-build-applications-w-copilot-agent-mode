import { Error as MongooseError, isValidObjectId } from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw Object.assign(new Error('Invalid activity input'), { status: 400 });
  }
  const { userId, teamId, type, minutes } = input as Record<string, unknown>;
  if (typeof userId !== 'string' || !isValidObjectId(userId) ||
      typeof teamId !== 'string' || !isValidObjectId(teamId) ||
      typeof type !== 'string' || !type.trim() ||
      typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw Object.assign(new Error('Invalid activity input'), { status: 400 });
  }
  const [user, team] = await Promise.all([User.exists({ _id: userId }), Team.exists({ _id: teamId })]);
  if (!user || !team) {
    throw Object.assign(new Error('User or team not found'), { status: 400 });
  }
  return Activity.create({ user: userId, team: teamId, type, minutes, points: minutes, occurredAt: new Date() });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw Object.assign(new Error('Invalid team input'), { status: 400 });
  }
  const { name, mascot, members } = input as Record<string, unknown>;
  const team = new Team({ name, mascot, members });
  try {
    await team.validate();
  } catch (error) {
    if (error instanceof MongooseError.ValidationError) {
      throw Object.assign(error, { status: 400 });
    }
    throw error;
  }
  return team.save();
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate<{ teamName: string; totalPoints: number }>([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $lookup: { from: Team.collection.name, localField: '_id', foreignField: '_id', as: 'team' } },
    { $unwind: '$team' },
    { $sort: { totalPoints: -1, 'team.name': 1, _id: 1 } },
    { $project: { _id: 0, teamName: '$team.name', totalPoints: 1 } },
  ]);
  return totals.map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const activities = await Activity.aggregate<{ _id: string; totalMinutes: number }>([
    { $match: { user: user._id } },
    { $group: { _id: '$type', totalMinutes: { $sum: '$minutes' } } },
    { $sort: { totalMinutes: -1, _id: 1 } },
    { $limit: 1 },
  ]);
  const activityType = activities[0]?._id;
  const focus = activityType === 'run' || activityType === 'cycle' ? 'endurance' : activityType;
  let workouts = focus ? await Workout.find({ focus }).lean() : [];
  let reason = `Matches your ${activityType} activity`;
  if (!workouts.length) {
    workouts = await Workout.find({ focus: user.fitnessGoal }).lean();
    reason = `Matches your ${user.fitnessGoal} fitness goal`;
  }
  return workouts.map((workout) => ({ ...workout, reason }));
}

export { User };
