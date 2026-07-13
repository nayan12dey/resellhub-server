import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

                const newProduct = {
                    ...product,
                    createdAt: new Date(),
                };

                if (
                    !product.title ||
                    !product.description ||
                    !product.price ||
                    !product.category
                ) {
                    return res.status(400).send({
                        success: false,
                        message: "Missing required fields",
                    });
                }

                const result = await productsCollection.insertOne(newProduct);

                res.status(201).send({
                    success: true,
                    insertedId: result.insertedId,
                    message: "Product added successfully",
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

                const limit = Number(req.query.limit) || 0;

                const cursor = productsCollection
                    .find({})
                    .sort({ createdAt: -1 });

                if (limit > 0) {
                    cursor.limit(limit);
                }

                const products = await cursor.toArray();

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

        // get statistics data
        app.get("/statistics/chart", async (req: Request, res: Response) => {
            try {
                const chartData = await productsCollection.aggregate([
                    {
                        $group: {
                            _id: "$category",
                            value: { $sum: 1 }
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            name: "$_id",
                            value: 1
                        }
                    }
                ]).toArray();

                res.send(chartData);
            } catch (error) {
                console.error(error);

                res.status(500).send({
                    success: false,
                    message: "Failed to fetch chart data"
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


