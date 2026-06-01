import dotenv from "dotenv";
import connectDB from "./config/db";
import User from "./models/User";

dotenv.config();

const seed = async () => {
  await connectDB();

  const user = await User.findOne({ username: "H4mmurabi98" });

  if (user) {
    // Email und Passwort aktualisieren (pre-save hook hasht das Passwort)
    user.email    = "frostaliraqi98@gmail.com";
    user.password = "19982000";
    await user.save();
    console.log("Test-Account aktualisiert: frostaliraqi98@gmail.com / 19982000");
  } else {
    await User.create({
      username: "H4mmurabi98",
      email:    "frostaliraqi98@gmail.com",
      password: "19982000",
    });
    console.log("Test-Account erstellt: frostaliraqi98@gmail.com / 19982000");
  }

  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
