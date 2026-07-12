import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const { MongoClient, ServerApiVersion, ObjectId  } = require('mongodb');
const uri = process.env.MONGODB_URI;

if (!uri) {
    throw new Error("MONGODB_URI is missing");
}



const app: Application = express();
const port = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req: Request, res: Response) => {
    res.send("ResellHub Server is Running...");
});

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        const database = client.db(process.env.DB_NAME);

        const productsCollection = database.collection("products");
        const usersCollection = database.collection("users");


        // insert products
        app.post("/products", async (req: Request, res: Response) => {
            try {
                const product = req.body;

                const result = await productsCollection.insertOne(product);

                res.status(201).send({
                    success: true,
                    message: "Product added successfully",
                    insertedId: result.insertedId,
                });

            } catch (error) {
                console.error(error);

                res.status(500).send({
                    success: false,
                    message: "Failed to add product",
                });
            }
        });

        // get all products
        app.get("/products", async (req: Request, res: Response) => {
            try {
                const products = await productsCollection.find().toArray();

                res.send(products);
            } catch (error) {
                console.error(error);

                res.status(500).send({
                    success: false,
                    message: "Failed to fetch products",
                });
            }
        });

        // get product details by id
        app.get("/products/:id", async (req: Request, res: Response) => {
            try {
                const id = req.params.id;

                const product = await productsCollection.findOne({
                    _id: new ObjectId(id),
                });

                if (!product) {
                    return res.status(404).send({
                        success: false,
                        message: "Product not found",
                    });
                }

                res.send(product);
            } catch (error) {
                console.error(error);

                res.status(500).send({
                    success: false,
                    message: "Failed to fetch product",
                });
            }
        });









        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


