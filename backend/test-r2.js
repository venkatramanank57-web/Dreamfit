import r2Service from "./services/r2.service.js";

const testR2 = async () => {
  console.log("🧪 Testing R2 connection...");
  
  // Create a tiny test file
  const testFile = {
    buffer: Buffer.from("Hello R2!"),
    mimetype: "text/plain",
    originalname: "test.txt",
    size: 9
  };
  
  const result = await r2Service.uploadFile(testFile, "test.txt");
  console.log("Upload result:", result);
  
  if (result.success) {
    console.log("✅ Test file uploaded to:", result.url);
  }
};

testR2();