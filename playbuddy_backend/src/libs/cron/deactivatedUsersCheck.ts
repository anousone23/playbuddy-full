import cron from "node-cron";
import { User } from "../../models/user.model";

// Run this every day at midnight
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily check for deactivated users...");

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  //   const now = new Date(Date.now());

  try {
    const deactivatedUsers = await User.find({
      isDeactivate: true,
      deactivatedAt: { $lte: sevenDaysAgo },
    });

    if (deactivatedUsers.length > 0) {
      for (const user of deactivatedUsers) {
        console.log(
          `User ${user.name} (${user.email}) has been deactivated for more than 7 days.`
        );

        user.name = `Deleted User`;
        user.email = `${user._id}@deleted.com`;
        user.image =
          "https://www.shutterstock.com/image-vector/user-removal-linear-style-icon-600nw-2473043843.jpg";

        await user.save();

        console.log(`Updated user: ${user._id}`);
      }
    } else {
      console.log("No users have been deactivated for more than 7 days.");
    }
  } catch (error) {
    console.error("Error during deactivated users check:", error);
  }
});
