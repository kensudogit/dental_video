import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type AnalyticsBoard = {
  __typename?: 'AnalyticsBoard';
  completionsByCategory: Array<CategoryMetric>;
  kpis: Array<AnalyticsKpi>;
  learnerEngagementScore: Scalars['Float']['output'];
  periodDays: Scalars['Int']['output'];
  topVideos: Array<VideoMetric>;
  watchHoursByWeek: Array<Scalars['Float']['output']>;
};

export type AnalyticsInsight = {
  __typename?: 'AnalyticsInsight';
  generatedAt: Scalars['String']['output'];
  recommendations: Array<Scalars['String']['output']>;
  risks: Array<Scalars['String']['output']>;
  strengths: Array<Scalars['String']['output']>;
  summary: Scalars['String']['output'];
};

export type AnalyticsKpi = {
  __typename?: 'AnalyticsKpi';
  label: Scalars['String']['output'];
  trendPct: Maybe<Scalars['Float']['output']>;
  unit: Maybe<Scalars['String']['output']>;
  value: Scalars['Float']['output'];
};

export type Bookmark = {
  __typename?: 'Bookmark';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  learnerId: Scalars['ID']['output'];
  videoId: Scalars['ID']['output'];
};

export type CategoryMetric = {
  __typename?: 'CategoryMetric';
  category: VideoCategory;
  count: Scalars['Int']['output'];
};

export type Certificate = {
  __typename?: 'Certificate';
  id: Scalars['ID']['output'];
  issuedAt: Scalars['String']['output'];
  learnerId: Scalars['ID']['output'];
  pathId: Scalars['ID']['output'];
  title: Scalars['String']['output'];
};

export type CreateVideoNoteInput = {
  body: Scalars['String']['input'];
  learnerId: Scalars['ID']['input'];
  timestampSec: Scalars['Int']['input'];
  videoId: Scalars['ID']['input'];
};

export type DashboardStats = {
  __typename?: 'DashboardStats';
  activeLearners: Scalars['Int']['output'];
  completionsThisMonth: Scalars['Int']['output'];
  learningPathsTotal: Scalars['Int']['output'];
  quizzesTotal: Scalars['Int']['output'];
  videosTotal: Scalars['Int']['output'];
  watchHoursThisMonth: Scalars['Float']['output'];
};

export type Health = {
  __typename?: 'Health';
  ok: Scalars['Boolean']['output'];
  service: Scalars['String']['output'];
  version: Scalars['String']['output'];
};

export type Instructor = {
  __typename?: 'Instructor';
  avatarUrl: Scalars['String']['output'];
  bio: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  specialty: Scalars['String']['output'];
  title: Scalars['String']['output'];
  videoCount: Scalars['Int']['output'];
};

export type LearningActivityEvent = {
  __typename?: 'LearningActivityEvent';
  kind: LearningActivityKind;
  learnerId: Scalars['ID']['output'];
  message: Scalars['String']['output'];
  occurredAt: Scalars['String']['output'];
  pathId: Maybe<Scalars['ID']['output']>;
  quizId: Maybe<Scalars['ID']['output']>;
  videoId: Maybe<Scalars['ID']['output']>;
};

export enum LearningActivityKind {
  BookmarkToggled = 'BOOKMARK_TOGGLED',
  NoteCreated = 'NOTE_CREATED',
  PathEnrolled = 'PATH_ENROLLED',
  ProgressUpdated = 'PROGRESS_UPDATED',
  QuizSubmitted = 'QUIZ_SUBMITTED'
}

export type LearningPath = {
  __typename?: 'LearningPath';
  category: VideoCategory;
  certificateTitle: Scalars['String']['output'];
  description: Scalars['String']['output'];
  enrolledCount: Scalars['Int']['output'];
  estimatedMinutes: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  skillLevel: SkillLevel;
  title: Scalars['String']['output'];
  videoIds: Array<Scalars['ID']['output']>;
};

export enum MemberRole {
  Admin = 'ADMIN',
  Member = 'MEMBER',
  Owner = 'OWNER',
  Viewer = 'VIEWER'
}

export type Mutation = {
  __typename?: 'Mutation';
  createVideoNote: VideoNote;
  deleteVideoNote: Scalars['Boolean']['output'];
  enrollLearningPath: LearningPath;
  generateAnalyticsInsight: AnalyticsInsight;
  submitQuizAttempt: QuizAttempt;
  toggleBookmark: Maybe<Bookmark>;
  updateOrganization: Organization;
  updateWatchProgress: WatchProgress;
};


export type MutationCreateVideoNoteArgs = {
  input: CreateVideoNoteInput;
};


export type MutationDeleteVideoNoteArgs = {
  id: Scalars['ID']['input'];
};


export type MutationEnrollLearningPathArgs = {
  learnerId: Scalars['ID']['input'];
  pathId: Scalars['ID']['input'];
};


export type MutationGenerateAnalyticsInsightArgs = {
  periodDays?: InputMaybe<Scalars['Int']['input']>;
};


export type MutationSubmitQuizAttemptArgs = {
  input: SubmitQuizAttemptInput;
};


export type MutationToggleBookmarkArgs = {
  learnerId: Scalars['ID']['input'];
  videoId: Scalars['ID']['input'];
};


export type MutationUpdateOrganizationArgs = {
  input: UpdateOrganizationInput;
};


export type MutationUpdateWatchProgressArgs = {
  input: UpdateWatchProgressInput;
};

export type Organization = {
  __typename?: 'Organization';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  memberCount: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  planTier: PlanTier;
  seatCount: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  subscriptionStatus: SubscriptionStatus;
  timezone: Scalars['String']['output'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  page: Scalars['Int']['output'];
  pageSize: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  totalPages: Scalars['Int']['output'];
};

export enum PlanTier {
  Enterprise = 'ENTERPRISE',
  Free = 'FREE',
  Pro = 'PRO',
  Starter = 'STARTER'
}

export type Query = {
  __typename?: 'Query';
  analyticsBoard: AnalyticsBoard;
  currentSession: Maybe<Session>;
  dashboard: DashboardStats;
  featuredVideos: Array<Video>;
  health: Health;
  instructor: Maybe<Instructor>;
  instructors: Array<Instructor>;
  learningPath: Maybe<LearningPath>;
  learningPaths: Array<LearningPath>;
  myBookmarks: Array<Bookmark>;
  myCertificates: Array<Certificate>;
  myProgress: Array<WatchProgress>;
  myQuizAttempts: Array<QuizAttempt>;
  organization: Organization;
  quiz: Maybe<Quiz>;
  quizzes: Array<Quiz>;
  teamMembers: Array<TeamMember>;
  usageSummary: UsageSummary;
  video: Maybe<Video>;
  videoNotes: Array<VideoNote>;
  videos: VideoPage;
};


export type QueryAnalyticsBoardArgs = {
  periodDays?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryInstructorArgs = {
  id: Scalars['ID']['input'];
};


export type QueryLearningPathArgs = {
  id: Scalars['ID']['input'];
};


export type QueryLearningPathsArgs = {
  category?: InputMaybe<VideoCategory>;
  skillLevel?: InputMaybe<SkillLevel>;
};


export type QueryMyBookmarksArgs = {
  learnerId: Scalars['ID']['input'];
};


export type QueryMyCertificatesArgs = {
  learnerId: Scalars['ID']['input'];
};


export type QueryMyProgressArgs = {
  learnerId: Scalars['ID']['input'];
};


export type QueryMyQuizAttemptsArgs = {
  learnerId: Scalars['ID']['input'];
};


export type QueryQuizArgs = {
  id: Scalars['ID']['input'];
};


export type QueryQuizzesArgs = {
  videoId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryVideoArgs = {
  id: Scalars['ID']['input'];
};


export type QueryVideoNotesArgs = {
  learnerId: Scalars['ID']['input'];
  videoId: Scalars['ID']['input'];
};


export type QueryVideosArgs = {
  category?: InputMaybe<VideoCategory>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  skillLevel?: InputMaybe<SkillLevel>;
};

export type Quiz = {
  __typename?: 'Quiz';
  id: Scalars['ID']['output'];
  passingScore: Scalars['Int']['output'];
  questions: Array<QuizQuestion>;
  title: Scalars['String']['output'];
  videoId: Maybe<Scalars['ID']['output']>;
};

export type QuizAttempt = {
  __typename?: 'QuizAttempt';
  completedAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  learnerId: Scalars['ID']['output'];
  passed: Scalars['Boolean']['output'];
  quizId: Scalars['ID']['output'];
  score: Scalars['Int']['output'];
};

export type QuizChoice = {
  __typename?: 'QuizChoice';
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
};

export type QuizQuestion = {
  __typename?: 'QuizQuestion';
  choices: Array<QuizChoice>;
  correctIndex: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  prompt: Scalars['String']['output'];
};

export type Session = {
  __typename?: 'Session';
  organization: Organization;
  role: MemberRole;
  user: User;
};

export enum SkillLevel {
  Advanced = 'ADVANCED',
  Beginner = 'BEGINNER',
  Intermediate = 'INTERMEDIATE'
}

export type SubmitQuizAttemptInput = {
  answers: Array<Scalars['Int']['input']>;
  learnerId: Scalars['ID']['input'];
  quizId: Scalars['ID']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  /** Dashboard stats refresh (reserved for live analytics) */
  dashboardUpdated: DashboardStats;
  /** Learning activity stream (progress, notes, bookmarks, enroll, quiz) */
  learningActivity: LearningActivityEvent;
  /** Learner watch progress updates */
  progressUpdated: WatchProgress;
};


export type SubscriptionLearningActivityArgs = {
  learnerId: Scalars['ID']['input'];
};


export type SubscriptionProgressUpdatedArgs = {
  learnerId: Scalars['ID']['input'];
};

export enum SubscriptionStatus {
  Active = 'ACTIVE',
  Canceled = 'CANCELED',
  PastDue = 'PAST_DUE',
  Trialing = 'TRIALING'
}

export type TeamMember = {
  __typename?: 'TeamMember';
  id: Scalars['ID']['output'];
  joinedAt: Scalars['String']['output'];
  lastActiveAt: Scalars['String']['output'];
  role: MemberRole;
  user: User;
};

export type UpdateOrganizationInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  seatCount?: InputMaybe<Scalars['Int']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWatchProgressInput = {
  completed?: InputMaybe<Scalars['Boolean']['input']>;
  learnerId: Scalars['ID']['input'];
  positionSec: Scalars['Int']['input'];
  videoId: Scalars['ID']['input'];
};

export type UsageSummary = {
  __typename?: 'UsageSummary';
  apiCallsLimit: Scalars['Int']['output'];
  apiCallsThisMonth: Scalars['Int']['output'];
  consultTokensMonth: Scalars['Int']['output'];
  members: Scalars['Int']['output'];
  membersLimit: Scalars['Int']['output'];
  videos: Scalars['Int']['output'];
  videosLimit: Scalars['Int']['output'];
};

export type User = {
  __typename?: 'User';
  avatarUrl: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Video = {
  __typename?: 'Video';
  category: VideoCategory;
  description: Scalars['String']['output'];
  durationSec: Scalars['Int']['output'];
  featured: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  instructorId: Scalars['ID']['output'];
  instructorName: Maybe<Scalars['String']['output']>;
  procedure: Scalars['String']['output'];
  publishedAt: Scalars['String']['output'];
  skillLevel: SkillLevel;
  tags: Array<Scalars['String']['output']>;
  thumbnailUrl: Scalars['String']['output'];
  title: Scalars['String']['output'];
  videoUrl: Scalars['String']['output'];
  viewCount: Scalars['Int']['output'];
};

export enum VideoCategory {
  Communication = 'COMMUNICATION',
  Endodontics = 'ENDODONTICS',
  Implant = 'IMPLANT',
  InfectionControl = 'INFECTION_CONTROL',
  OralSurgery = 'ORAL_SURGERY',
  Orthodontics = 'ORTHODONTICS',
  Pediatric = 'PEDIATRIC',
  Periodontics = 'PERIODONTICS',
  Prosthodontics = 'PROSTHODONTICS',
  Radiology = 'RADIOLOGY'
}

export type VideoMetric = {
  __typename?: 'VideoMetric';
  completions: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  videoId: Scalars['ID']['output'];
  views: Scalars['Int']['output'];
};

export type VideoNote = {
  __typename?: 'VideoNote';
  body: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  learnerId: Scalars['ID']['output'];
  timestampSec: Scalars['Int']['output'];
  videoId: Scalars['ID']['output'];
};

export type VideoPage = {
  __typename?: 'VideoPage';
  items: Array<Video>;
  pageInfo: PageInfo;
};

export type WatchProgress = {
  __typename?: 'WatchProgress';
  completed: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  learnerId: Scalars['ID']['output'];
  positionSec: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
  videoId: Scalars['ID']['output'];
};

export type BoardAnalyticsPageQueryVariables = Exact<{
  periodDays?: InputMaybe<Scalars['Int']['input']>;
}>;


export type BoardAnalyticsPageQuery = { __typename?: 'Query', analyticsBoard: { __typename?: 'AnalyticsBoard', periodDays: number, learnerEngagementScore: number, watchHoursByWeek: Array<number>, kpis: Array<{ __typename?: 'AnalyticsKpi', label: string, value: number, unit: string | null, trendPct: number | null }>, completionsByCategory: Array<{ __typename?: 'CategoryMetric', category: VideoCategory, count: number }>, topVideos: Array<{ __typename?: 'VideoMetric', videoId: string, title: string, views: number, completions: number }> } };

export type GenerateAnalyticsInsightMutationVariables = Exact<{
  periodDays?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GenerateAnalyticsInsightMutation = { __typename?: 'Mutation', generateAnalyticsInsight: { __typename?: 'AnalyticsInsight', summary: string, strengths: Array<string>, risks: Array<string>, recommendations: Array<string>, generatedAt: string } };

export type DashboardPageQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardPageQuery = { __typename?: 'Query', dashboard: { __typename?: 'DashboardStats', videosTotal: number, learningPathsTotal: number, quizzesTotal: number, completionsThisMonth: number, watchHoursThisMonth: number, activeLearners: number }, featuredVideos: Array<{ __typename?: 'Video', id: string, title: string, category: VideoCategory, skillLevel: SkillLevel, durationSec: number, thumbnailUrl: string, instructorName: string | null, viewCount: number }>, learningPaths: Array<{ __typename?: 'LearningPath', id: string, title: string, category: VideoCategory, skillLevel: SkillLevel, estimatedMinutes: number, enrolledCount: number }> };

export type InstructorsPageQueryVariables = Exact<{ [key: string]: never; }>;


export type InstructorsPageQuery = { __typename?: 'Query', instructors: Array<{ __typename?: 'Instructor', id: string, name: string, title: string, specialty: string, bio: string, avatarUrl: string, videoCount: number }> };

export type LearningPageQueryVariables = Exact<{
  learnerId: Scalars['ID']['input'];
}>;


export type LearningPageQuery = { __typename?: 'Query', myProgress: Array<{ __typename?: 'WatchProgress', id: string, videoId: string, positionSec: number, completed: boolean, updatedAt: string }>, myBookmarks: Array<{ __typename?: 'Bookmark', id: string, videoId: string, createdAt: string }>, myCertificates: Array<{ __typename?: 'Certificate', id: string, pathId: string, title: string, issuedAt: string }>, videos: { __typename?: 'VideoPage', items: Array<{ __typename?: 'Video', id: string, title: string, thumbnailUrl: string, durationSec: number, category: VideoCategory }> }, learningPaths: Array<{ __typename?: 'LearningPath', id: string, title: string, videoIds: Array<string> }> };

export type UpdateWatchProgressMutationVariables = Exact<{
  input: UpdateWatchProgressInput;
}>;


export type UpdateWatchProgressMutation = { __typename?: 'Mutation', updateWatchProgress: { __typename?: 'WatchProgress', id: string, videoId: string, positionSec: number, completed: boolean, updatedAt: string } };

export type CreateVideoNoteMutationVariables = Exact<{
  input: CreateVideoNoteInput;
}>;


export type CreateVideoNoteMutation = { __typename?: 'Mutation', createVideoNote: { __typename?: 'VideoNote', id: string, videoId: string, timestampSec: number, body: string, createdAt: string } };

export type ToggleBookmarkMutationVariables = Exact<{
  videoId: Scalars['ID']['input'];
  learnerId: Scalars['ID']['input'];
}>;


export type ToggleBookmarkMutation = { __typename?: 'Mutation', toggleBookmark: { __typename?: 'Bookmark', id: string, videoId: string, learnerId: string } | null };

export type EnrollLearningPathMutationVariables = Exact<{
  pathId: Scalars['ID']['input'];
  learnerId: Scalars['ID']['input'];
}>;


export type EnrollLearningPathMutation = { __typename?: 'Mutation', enrollLearningPath: { __typename?: 'LearningPath', id: string, title: string, enrolledCount: number } };

export type SubmitQuizAttemptMutationVariables = Exact<{
  input: SubmitQuizAttemptInput;
}>;


export type SubmitQuizAttemptMutation = { __typename?: 'Mutation', submitQuizAttempt: { __typename?: 'QuizAttempt', id: string, score: number, passed: boolean, completedAt: string } };

export type PathsPageQueryVariables = Exact<{
  category?: InputMaybe<VideoCategory>;
  skillLevel?: InputMaybe<SkillLevel>;
}>;


export type PathsPageQuery = { __typename?: 'Query', learningPaths: Array<{ __typename?: 'LearningPath', id: string, title: string, description: string, category: VideoCategory, skillLevel: SkillLevel, videoIds: Array<string>, estimatedMinutes: number, enrolledCount: number, certificateTitle: string }> };

export type PathDetailPageQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type PathDetailPageQuery = { __typename?: 'Query', learningPath: { __typename?: 'LearningPath', id: string, title: string, description: string, category: VideoCategory, skillLevel: SkillLevel, videoIds: Array<string>, estimatedMinutes: number, enrolledCount: number, certificateTitle: string } | null, videos: { __typename?: 'VideoPage', items: Array<{ __typename?: 'Video', id: string, title: string, durationSec: number, thumbnailUrl: string, category: VideoCategory, skillLevel: SkillLevel }> } };

export type QuizzesPageQueryVariables = Exact<{
  learnerId: Scalars['ID']['input'];
}>;


export type QuizzesPageQuery = { __typename?: 'Query', quizzes: Array<{ __typename?: 'Quiz', id: string, videoId: string | null, title: string, passingScore: number, questions: Array<{ __typename?: 'QuizQuestion', id: string }> }>, myQuizAttempts: Array<{ __typename?: 'QuizAttempt', id: string, quizId: string, score: number, passed: boolean, completedAt: string }> };

export type QuizTakePageQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type QuizTakePageQuery = { __typename?: 'Query', quiz: { __typename?: 'Quiz', id: string, videoId: string | null, title: string, passingScore: number, questions: Array<{ __typename?: 'QuizQuestion', id: string, prompt: string, correctIndex: number, choices: Array<{ __typename?: 'QuizChoice', id: string, label: string }> }> } | null };

export type CurrentSessionQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrentSessionQuery = { __typename?: 'Query', currentSession: { __typename?: 'Session', role: MemberRole, user: { __typename?: 'User', id: string, email: string, name: string }, organization: { __typename?: 'Organization', id: string, name: string, slug: string, planTier: PlanTier, subscriptionStatus: SubscriptionStatus, seatCount: number, memberCount: number } } | null };

export type OrganizationSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type OrganizationSettingsQuery = { __typename?: 'Query', organization: { __typename?: 'Organization', id: string, name: string, slug: string, planTier: PlanTier, subscriptionStatus: SubscriptionStatus, seatCount: number, timezone: string, memberCount: number, createdAt: string }, usageSummary: { __typename?: 'UsageSummary', members: number, membersLimit: number, videos: number, videosLimit: number, apiCallsThisMonth: number, apiCallsLimit: number, consultTokensMonth: number }, teamMembers: Array<{ __typename?: 'TeamMember', id: string, role: MemberRole, joinedAt: string, user: { __typename?: 'User', id: string, email: string, name: string } }> };

export type UpdateOrganizationMutationVariables = Exact<{
  input: UpdateOrganizationInput;
}>;


export type UpdateOrganizationMutation = { __typename?: 'Mutation', updateOrganization: { __typename?: 'Organization', id: string, name: string, slug: string, seatCount: number, timezone: string } };

export type DashboardUpdatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type DashboardUpdatedSubscription = { __typename?: 'Subscription', dashboardUpdated: { __typename?: 'DashboardStats', videosTotal: number, learningPathsTotal: number, quizzesTotal: number, completionsThisMonth: number, watchHoursThisMonth: number, activeLearners: number } };

export type ProgressUpdatedSubscriptionVariables = Exact<{
  learnerId: Scalars['ID']['input'];
}>;


export type ProgressUpdatedSubscription = { __typename?: 'Subscription', progressUpdated: { __typename?: 'WatchProgress', id: string, videoId: string, positionSec: number, completed: boolean, updatedAt: string } };

export type LearningActivitySubscriptionVariables = Exact<{
  learnerId: Scalars['ID']['input'];
}>;


export type LearningActivitySubscription = { __typename?: 'Subscription', learningActivity: { __typename?: 'LearningActivityEvent', kind: LearningActivityKind, learnerId: string, videoId: string | null, pathId: string | null, quizId: string | null, message: string, occurredAt: string } };

export type VideosPageQueryVariables = Exact<{
  category?: InputMaybe<VideoCategory>;
  skillLevel?: InputMaybe<SkillLevel>;
  search?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
}>;


export type VideosPageQuery = { __typename?: 'Query', videos: { __typename?: 'VideoPage', items: Array<{ __typename?: 'Video', id: string, title: string, description: string, category: VideoCategory, procedure: string, skillLevel: SkillLevel, durationSec: number, thumbnailUrl: string, instructorName: string | null, viewCount: number, featured: boolean }>, pageInfo: { __typename?: 'PageInfo', total: number, page: number, pageSize: number, totalPages: number } } };

export type VideoDetailPageQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  learnerId: Scalars['ID']['input'];
}>;


export type VideoDetailPageQuery = { __typename?: 'Query', video: { __typename?: 'Video', id: string, title: string, description: string, category: VideoCategory, procedure: string, skillLevel: SkillLevel, durationSec: number, thumbnailUrl: string, videoUrl: string, instructorId: string, instructorName: string | null, tags: Array<string>, viewCount: number, publishedAt: string } | null, videoNotes: Array<{ __typename?: 'VideoNote', id: string, timestampSec: number, body: string, createdAt: string }>, quizzes: Array<{ __typename?: 'Quiz', id: string, title: string, passingScore: number, questions: Array<{ __typename?: 'QuizQuestion', id: string, prompt: string, choices: Array<{ __typename?: 'QuizChoice', id: string, label: string }> }> }>, myProgress: Array<{ __typename?: 'WatchProgress', videoId: string, positionSec: number, completed: boolean }>, myBookmarks: Array<{ __typename?: 'Bookmark', videoId: string }> };


export const BoardAnalyticsPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BoardAnalyticsPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodDays"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"analyticsBoard"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"periodDays"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodDays"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"periodDays"}},{"kind":"Field","name":{"kind":"Name","value":"learnerEngagementScore"}},{"kind":"Field","name":{"kind":"Name","value":"watchHoursByWeek"}},{"kind":"Field","name":{"kind":"Name","value":"kpis"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}},{"kind":"Field","name":{"kind":"Name","value":"trendPct"}}]}},{"kind":"Field","name":{"kind":"Name","value":"completionsByCategory"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"topVideos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"views"}},{"kind":"Field","name":{"kind":"Name","value":"completions"}}]}}]}}]}}]} as unknown as DocumentNode<BoardAnalyticsPageQuery, BoardAnalyticsPageQueryVariables>;
export const GenerateAnalyticsInsightDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GenerateAnalyticsInsight"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"periodDays"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"generateAnalyticsInsight"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"periodDays"},"value":{"kind":"Variable","name":{"kind":"Name","value":"periodDays"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"summary"}},{"kind":"Field","name":{"kind":"Name","value":"strengths"}},{"kind":"Field","name":{"kind":"Name","value":"risks"}},{"kind":"Field","name":{"kind":"Name","value":"recommendations"}},{"kind":"Field","name":{"kind":"Name","value":"generatedAt"}}]}}]}}]} as unknown as DocumentNode<GenerateAnalyticsInsightMutation, GenerateAnalyticsInsightMutationVariables>;
export const DashboardPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DashboardPage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videosTotal"}},{"kind":"Field","name":{"kind":"Name","value":"learningPathsTotal"}},{"kind":"Field","name":{"kind":"Name","value":"quizzesTotal"}},{"kind":"Field","name":{"kind":"Name","value":"completionsThisMonth"}},{"kind":"Field","name":{"kind":"Name","value":"watchHoursThisMonth"}},{"kind":"Field","name":{"kind":"Name","value":"activeLearners"}}]}},{"kind":"Field","name":{"kind":"Name","value":"featuredVideos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"skillLevel"}},{"kind":"Field","name":{"kind":"Name","value":"durationSec"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"instructorName"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"learningPaths"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"skillLevel"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"enrolledCount"}}]}}]}}]} as unknown as DocumentNode<DashboardPageQuery, DashboardPageQueryVariables>;
export const InstructorsPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"InstructorsPage"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"instructors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"specialty"}},{"kind":"Field","name":{"kind":"Name","value":"bio"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}},{"kind":"Field","name":{"kind":"Name","value":"videoCount"}}]}}]}}]} as unknown as DocumentNode<InstructorsPageQuery, InstructorsPageQueryVariables>;
export const LearningPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LearningPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myProgress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"positionSec"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"myBookmarks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"myCertificates"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"pathId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"issuedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"videos"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"pageSize"},"value":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"durationSec"}},{"kind":"Field","name":{"kind":"Name","value":"category"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"learningPaths"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"videoIds"}}]}}]}}]} as unknown as DocumentNode<LearningPageQuery, LearningPageQueryVariables>;
export const UpdateWatchProgressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateWatchProgress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateWatchProgressInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateWatchProgress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"positionSec"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateWatchProgressMutation, UpdateWatchProgressMutationVariables>;
export const CreateVideoNoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateVideoNote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateVideoNoteInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createVideoNote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"timestampSec"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateVideoNoteMutation, CreateVideoNoteMutationVariables>;
export const ToggleBookmarkDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ToggleBookmark"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"videoId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"toggleBookmark"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"videoId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"videoId"}}},{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"learnerId"}}]}}]}}]} as unknown as DocumentNode<ToggleBookmarkMutation, ToggleBookmarkMutationVariables>;
export const EnrollLearningPathDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"EnrollLearningPath"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pathId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"enrollLearningPath"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pathId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pathId"}}},{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"enrolledCount"}}]}}]}}]} as unknown as DocumentNode<EnrollLearningPathMutation, EnrollLearningPathMutationVariables>;
export const SubmitQuizAttemptDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitQuizAttempt"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SubmitQuizAttemptInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitQuizAttempt"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"passed"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]} as unknown as DocumentNode<SubmitQuizAttemptMutation, SubmitQuizAttemptMutationVariables>;
export const PathsPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PathsPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"VideoCategory"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skillLevel"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SkillLevel"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"learningPaths"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}},{"kind":"Argument","name":{"kind":"Name","value":"skillLevel"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skillLevel"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"skillLevel"}},{"kind":"Field","name":{"kind":"Name","value":"videoIds"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"enrolledCount"}},{"kind":"Field","name":{"kind":"Name","value":"certificateTitle"}}]}}]}}]} as unknown as DocumentNode<PathsPageQuery, PathsPageQueryVariables>;
export const PathDetailPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PathDetailPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"learningPath"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"skillLevel"}},{"kind":"Field","name":{"kind":"Name","value":"videoIds"}},{"kind":"Field","name":{"kind":"Name","value":"estimatedMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"enrolledCount"}},{"kind":"Field","name":{"kind":"Name","value":"certificateTitle"}}]}},{"kind":"Field","name":{"kind":"Name","value":"videos"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"IntValue","value":"1"}},{"kind":"Argument","name":{"kind":"Name","value":"pageSize"},"value":{"kind":"IntValue","value":"50"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"durationSec"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"skillLevel"}}]}}]}}]}}]} as unknown as DocumentNode<PathDetailPageQuery, PathDetailPageQueryVariables>;
export const QuizzesPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"QuizzesPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quizzes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"passingScore"}},{"kind":"Field","name":{"kind":"Name","value":"questions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"myQuizAttempts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quizId"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"passed"}},{"kind":"Field","name":{"kind":"Name","value":"completedAt"}}]}}]}}]} as unknown as DocumentNode<QuizzesPageQuery, QuizzesPageQueryVariables>;
export const QuizTakePageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"QuizTakePage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"quiz"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"passingScore"}},{"kind":"Field","name":{"kind":"Name","value":"questions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"choices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"correctIndex"}}]}}]}}]}}]} as unknown as DocumentNode<QuizTakePageQuery, QuizTakePageQueryVariables>;
export const CurrentSessionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CurrentSession"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currentSession"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"planTier"}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionStatus"}},{"kind":"Field","name":{"kind":"Name","value":"seatCount"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<CurrentSessionQuery, CurrentSessionQueryVariables>;
export const OrganizationSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrganizationSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"organization"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"planTier"}},{"kind":"Field","name":{"kind":"Name","value":"subscriptionStatus"}},{"kind":"Field","name":{"kind":"Name","value":"seatCount"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"memberCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"usageSummary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"members"}},{"kind":"Field","name":{"kind":"Name","value":"membersLimit"}},{"kind":"Field","name":{"kind":"Name","value":"videos"}},{"kind":"Field","name":{"kind":"Name","value":"videosLimit"}},{"kind":"Field","name":{"kind":"Name","value":"apiCallsThisMonth"}},{"kind":"Field","name":{"kind":"Name","value":"apiCallsLimit"}},{"kind":"Field","name":{"kind":"Name","value":"consultTokensMonth"}}]}},{"kind":"Field","name":{"kind":"Name","value":"teamMembers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<OrganizationSettingsQuery, OrganizationSettingsQueryVariables>;
export const UpdateOrganizationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOrganization"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateOrganizationInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOrganization"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"seatCount"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}}]}}]}}]} as unknown as DocumentNode<UpdateOrganizationMutation, UpdateOrganizationMutationVariables>;
export const DashboardUpdatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"DashboardUpdated"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dashboardUpdated"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videosTotal"}},{"kind":"Field","name":{"kind":"Name","value":"learningPathsTotal"}},{"kind":"Field","name":{"kind":"Name","value":"quizzesTotal"}},{"kind":"Field","name":{"kind":"Name","value":"completionsThisMonth"}},{"kind":"Field","name":{"kind":"Name","value":"watchHoursThisMonth"}},{"kind":"Field","name":{"kind":"Name","value":"activeLearners"}}]}}]}}]} as unknown as DocumentNode<DashboardUpdatedSubscription, DashboardUpdatedSubscriptionVariables>;
export const ProgressUpdatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"ProgressUpdated"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"progressUpdated"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"positionSec"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ProgressUpdatedSubscription, ProgressUpdatedSubscriptionVariables>;
export const LearningActivityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"LearningActivity"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"learningActivity"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"learnerId"}},{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"pathId"}},{"kind":"Field","name":{"kind":"Name","value":"quizId"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"occurredAt"}}]}}]}}]} as unknown as DocumentNode<LearningActivitySubscription, LearningActivitySubscriptionVariables>;
export const VideosPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"VideosPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"category"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"VideoCategory"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"skillLevel"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SkillLevel"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videos"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"category"},"value":{"kind":"Variable","name":{"kind":"Name","value":"category"}}},{"kind":"Argument","name":{"kind":"Name","value":"skillLevel"},"value":{"kind":"Variable","name":{"kind":"Name","value":"skillLevel"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"pageSize"},"value":{"kind":"IntValue","value":"12"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"procedure"}},{"kind":"Field","name":{"kind":"Name","value":"skillLevel"}},{"kind":"Field","name":{"kind":"Name","value":"durationSec"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"instructorName"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}},{"kind":"Field","name":{"kind":"Name","value":"featured"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"pageSize"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]}}]}}]} as unknown as DocumentNode<VideosPageQuery, VideosPageQueryVariables>;
export const VideoDetailPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"VideoDetailPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"video"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"category"}},{"kind":"Field","name":{"kind":"Name","value":"procedure"}},{"kind":"Field","name":{"kind":"Name","value":"skillLevel"}},{"kind":"Field","name":{"kind":"Name","value":"durationSec"}},{"kind":"Field","name":{"kind":"Name","value":"thumbnailUrl"}},{"kind":"Field","name":{"kind":"Name","value":"videoUrl"}},{"kind":"Field","name":{"kind":"Name","value":"instructorId"}},{"kind":"Field","name":{"kind":"Name","value":"instructorName"}},{"kind":"Field","name":{"kind":"Name","value":"tags"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}},{"kind":"Field","name":{"kind":"Name","value":"publishedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"videoNotes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"videoId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"timestampSec"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"quizzes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"videoId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"passingScore"}},{"kind":"Field","name":{"kind":"Name","value":"questions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"prompt"}},{"kind":"Field","name":{"kind":"Name","value":"choices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"myProgress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videoId"}},{"kind":"Field","name":{"kind":"Name","value":"positionSec"}},{"kind":"Field","name":{"kind":"Name","value":"completed"}}]}},{"kind":"Field","name":{"kind":"Name","value":"myBookmarks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"learnerId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"learnerId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"videoId"}}]}}]}}]} as unknown as DocumentNode<VideoDetailPageQuery, VideoDetailPageQueryVariables>;