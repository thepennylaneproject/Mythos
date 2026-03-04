import { eq } from "drizzle-orm";
import { db, pool } from "./db";
import { accounts, campaigns, postPlans, posts, projects, tasks, users, vendorTokens } from "./schema";

async function seed() {
  const now = new Date();
  const twoWeeksFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const demoUserEmail = "demo@mythos.local";
  const existingUser = await db.query.users.findFirst({ where: eq(users.email, demoUserEmail) });
  const user = existingUser ?? (await db.insert(users).values({
    email: demoUserEmail,
    name: "Demo User",
    image: "https://www.gravatar.com/avatar/demo?d=identicon"
  }).returning())[0];

  const existingAccount = await db.query.accounts.findFirst({ where: eq(accounts.name, "Mythos Demo Brand") });
  const account = existingAccount ?? (await db.insert(accounts).values({
    name: "Mythos Demo Brand",
    tier: "customer",
    domain: "demo.mythos.local",
    owner: user.id,
    notes: "Auto-created by seed script"
  }).returning())[0];

  const existingProject = await db.query.projects.findFirst({ where: eq(projects.name, "Mythos Launch Campaign") });
  const project = existingProject ?? (await db.insert(projects).values({
    accountId: account.id,
    name: "Mythos Launch Campaign",
    status: "active",
    startAt: now,
    endAt: twoWeeksFromNow
  }).returning())[0];

  const existingTasks = await db.query.tasks.findMany({ where: eq(tasks.projectId, project.id) });
  if (!existingTasks.length) {
    await db.insert(tasks).values([
      {
        projectId: project.id,
        title: "Wire up authentication and session handling",
        status: "doing",
        assignee: user.id,
        priority: "high",
        points: 3,
        dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      },
      {
        projectId: project.id,
        title: "Draft campaign brief and target personas",
        status: "todo",
        assignee: user.id,
        priority: "med",
        points: 2,
        dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      },
      {
        projectId: project.id,
        title: "Schedule first wave of social posts",
        status: "review",
        assignee: user.id,
        priority: "high",
        points: 2,
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    ]);
  }

  const existingCampaign = await db.query.campaigns.findFirst({ where: eq(campaigns.projectId, project.id) });
  const campaign = existingCampaign ?? (await db.insert(campaigns).values({
    projectId: project.id,
    goal: "Launch Mythos to early adopters",
    brief: "Tell the story of AI-assisted content teams shipping faster.",
    audience: ["founders", "content leads", "marketing ops"],
    channels: ["linkedin", "instagram"],
    status: "scheduled"
  }).returning())[0];

  const existingPlan = await db.query.postPlans.findFirst({ where: eq(postPlans.campaignId, campaign.id) });
  const plan = existingPlan ?? (await db.insert(postPlans).values({
    campaignId: campaign.id,
    channel: "linkedin",
    hypothesis: "Narrative-first posts convert founders better than feature dumps.",
    slotAt: new Date(Date.now() + 36 * 60 * 60 * 1000),
    variants: 2,
    experiment: { cta: "Book a walkthrough", creative: "long-form storytelling" }
  }).returning())[0];

  const existingPosts = await db.query.posts.findMany({ where: eq(posts.postPlanId, plan.id) });
  if (!existingPosts.length) {
    await db.insert(posts).values([
      {
        postPlanId: plan.id,
        channel: "linkedin",
        network: "linkedin",
        caption: "How Mythos keeps content teams in flow — from brief to publish.",
        tags: ["mythos", "storytelling", "b2b"],
        altText: "Mythos workflow storyboard",
        status: "scheduled",
        scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        publishStatus: "queued"
      },
      {
        postPlanId: plan.id,
        channel: "instagram",
        network: "meta",
        caption: "AI that writes with your brand's voice. Ready to pilot Mythos?",
        tags: ["ai", "marketing", "launch"],
        altText: "Colorful mythos brand gradient",
        status: "draft",
        publishStatus: "queued"
      }
    ]);
  }

  const vendorCreds = await db.query.vendorTokens.findMany({ where: eq(vendorTokens.accountId, account.id) });
  if (!vendorCreds.length) {
    await db.insert(vendorTokens).values([
      {
        vendor: "meta",
        accountId: account.id,
        accessToken: "meta-demo-access-token",
        refreshToken: "meta-demo-refresh",
        meta: { pageId: "1234567890", scope: ["instagram_basic", "pages_show_list"] }
      },
      {
        vendor: "linkedin",
        accountId: account.id,
        accessToken: "linkedin-demo-access-token",
        refreshToken: "linkedin-demo-refresh",
        meta: { organization: "urn:li:organization:demo" }
      },
      {
        vendor: "x",
        accountId: account.id,
        accessToken: "x-demo-access-token",
        refreshToken: "x-demo-refresh",
        meta: { handle: "@mythos" }
      }
    ]);
  }

  return {
    user,
    account,
    project,
    campaign
  };
}

seed()
  .then(async (result) => {
    console.log("Seeded Mythos demo data", {
      user: result.user.email,
      account: result.account.name,
      project: result.project.name,
      campaign: result.campaign.goal
    });
    await pool.end();
  })
  .catch(async (err) => {
    console.error("Failed to seed Mythos demo data", err);
    await pool.end();
    process.exit(1);
  });
