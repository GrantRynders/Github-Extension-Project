const express = require("express");
const app = express();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
app.use(express.json());



//ENDPOINT EXAMPLE
app.get("/user", async (req, res) => {
    const returnedUsers = await prisma.user.findMany();
    res.json(returnedUsers);
});
app.listen(3001, () => console.log('Server running on port ${3001}'));


//CREATE USER EXAMPLE
const user = await prisma.user.create({
    data: {
      UserName: 'JohnSmith',
    },
  })

//
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })