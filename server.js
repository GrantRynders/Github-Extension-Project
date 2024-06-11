const express = require("express");
const app = express();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
app.use(express.json());
app.get("/user", async (req, res) => {
    const returnedUsers = await prisma.user.findMany();
    res.json(returnedUsers);
});
app.listen(3001, () => console.log('Server running on port ${3001}'));