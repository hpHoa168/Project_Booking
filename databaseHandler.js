const { MongoClient, ObjectId } = require("mongodb");
// const { use } = require("./controllers/admin");

const URL = "mongodb://localhost:27017"
const DATABASE_NAME = "Project_Final"

async function getDB() {
    const client = await MongoClient.connect(URL)
    const dbo = client.db(DATABASE_NAME);
    return dbo;
}

async function insertObject(collectionName, objectToInsert) {
    const dbo = await getDB();
    const newObject = await dbo.collection(collectionName).insertOne(objectToInsert);
}

async function deleteMovie(id) {
    const dbo = await getDB();
    await dbo.collection("Movie").deleteOne({_id: ObjectId(id)});
    await dbo.collection("Coming-soon").deleteOne({_id: ObjectId(id)});
    await dbo.collection("Now-showing").deleteOne({_id: ObjectId(id)});
}
async function deleteCinema(id) {
    const dbo = await getDB();
    await dbo.collection("Cinema").deleteOne({_id: ObjectId(id)});
}
async function deleteRoom(id) {
    const dbo = await getDB();
    await dbo.collection("Room").deleteOne({_id: ObjectId(id)});
}
async function deleteSnack(id) {
    const dbo = await getDB();
    await dbo.collection("Snack").deleteOne({_id: ObjectId(id)});
}

async function deleteEvent(id) {
    const dbo = await getDB();
    await dbo.collection("Event").deleteOne({_id: ObjectId(id)});
}

async function deleteCate(id) {
    const dbo = await getDB();
    await dbo.collection("Category").deleteOne({_id: ObjectId(id)});
}
async function deleteSchedule(id) {
    const dbo = await getDB();
    await dbo.collection("Schedule").deleteOne({_id: ObjectId(id)});
    await dbo.collection("Movie").deleteOne({_id: ObjectId(id)});
    
}

async function deleteUser(userName){
    const dbo = await getDB();

    await dbo.collection("Customer").deleteOne({"userName": userName})
    await dbo.collection("Account").deleteOne({"userName": userName})
}

async function deleteManager(userName){
    const dbo = await getDB();

    await dbo.collection("Manager").deleteOne({"userName": userName})
    await dbo.collection("Account").deleteOne({"userName": userName})
}

async function getRole(nameI, passI){
    const dbo = await getDB()

    const user = await dbo.collection("Account").findOne({userName: nameI, passWord: passI})
    if(user == null){
        return "-1"
    }
    else{
        return user.role
    }
}

module.exports = {
    getDB,
    ObjectId,
    deleteMovie,
    insertObject,
    deleteManager,
    deleteUser,
    getRole,
    deleteCinema,
    deleteRoom,
    deleteSnack,
    deleteCate,
    deleteEvent,
    deleteSchedule
}