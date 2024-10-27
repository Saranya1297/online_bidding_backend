import express from 'express';
import { AppDataSource } from './data-source'
import { User } from './entity/User';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from "bcryptjs";
import { Auction } from './entity/Auction';
import { Bid } from './entity/Bid';
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = 9000;
app.use(express.json());
app.use(cors({origin: true}));

function autorizeRequest(req: any, res: any, next: any) {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token == null) return res.status(401).send("Invalid User")

        //jwt verification
        jwt.verify(token, process.env.ACCESS_TOKEN, (err: any, user: any) => {
            if (err) return res.status(403).send("Invalid User");
            req.user = user;
            next();
        })
    } catch (err) {
        console.log("Error in autorizeRequest::", err);
    }
}

AppDataSource.initialize().then(async () => {
    try {
        console.log("---DataSource has been initialized---")
    } catch (err) {
        console.log("Error in AppDataSource::", err);
    }
}).catch(error => console.log("Error in AppDataSource 1 ::", error))

app.listen(PORT, () => {
    console.log(`Application listening to the PORT ${PORT}`);
});

app.get('/api/get', autorizeRequest, async (req: any, res: any) => {
    const user = await AppDataSource.getRepository(User).find();
    res.send(user)
});

app.post(`/api/register`, async (req: any, res: any) => {
    try {
        const body = req.body;
        const isAlreadyExist = await AppDataSource.getRepository(User).findOne({where: {email: body.email}});
        if (isAlreadyExist) {
            res.status(409).send({status: 409, message: "Your Account Already Exist"})
        } else {
            const user: any = await AppDataSource.getRepository(User).create(body);
            const hashed: any = await bcrypt.hash(req.body.password, 10);
            user.password = hashed;
            const result = await AppDataSource.getRepository(User).save(user);
            res.status(201).send({status: 201, message: "Successfully registered"})
        }       
    } catch (err) {
        console.log("Error in POST API => ", err)
    }
});

app.post(`/api/delete/:id`, async (req: any, res: any) => {
    try {
        const id = parseInt(req.params.id);
        const findUser: any = await AppDataSource.getRepository(User).findOne({ where: { isDeleted: 0, id: id } });
        let result: any;
        if (findUser) {            
            findUser.isDeleted = 1;
            result = await AppDataSource.getRepository(User).save(findUser);
            res.send({status: 200, message: `Deleted Successfully`})
        } else {
            res.send({status: 200, message: 'Invalid User Id'})
        }        
        return id;
    } catch (err) {
        console.log("Error in delete API::", err);
    }
});

app.post('/api/login', async (req: any, res: any) => {
    try {
        const body = req.body;
        const isExistedUser: any = await AppDataSource.getRepository(User).findOne({where: {email: req.body.email}});
        if (isExistedUser) {
            const comparePwd: any = await bcrypt.compare(req.body.password, isExistedUser.password);
            if (comparePwd) {
                let userDetails = {
                    email: isExistedUser.email,
                    firstName: isExistedUser.firstName,
                    lastName: isExistedUser.lastName,
                    isActive: isExistedUser.isDeleted
                }
                const jwtTokenCreation = jwt.sign(userDetails, process.env.ACCESS_TOKEN);
                res.status(200).send({status: "200", message: "Successfully loggedIn", token: jwtTokenCreation, userDetails: userDetails})
            } else {
                res.status(401).send({status: "401", message: "Invalid Password"})
            }
        } else {
            res.status(401).send({status: "401", message: "Invalid User, Please register in our application"})
        }
    } catch (err) {
        console.log("Error in Login::", err);        
    }
});

app.post('/register', async (req: any, res: any) => {
    try {
        const hashed = await bcrypt.hash(req.body.password, 10);
        res.send(hashed);    
    } catch (err) {
        console.log("Error in entry::", err)
    }
});

app.post('/api/create/auction',async (req: any, res: any) => {
    try {
        const body = req.body;
        const isExistedAuction: any = await AppDataSource.getRepository(Auction).findOne({where: {title: req.body.title}});
        if (isExistedAuction) {
            res.status(409).send({status: "409", message: "Title name already exist, please try another title"})
        } else {
            const auction: any = await AppDataSource.getRepository(Auction).create(body);
            const result = await AppDataSource.getRepository(Auction).save(auction);
            res.status(201).send({status: 201, message: "Auction Item Created Successfully"})
        }
    } catch (err) {
        console.log("Error in create auction:: ", err);
    }
});

app.post("/api/create/bid", async(req: any, res: any) => {
    try {
        const body = req.body;
        const bid: any = AppDataSource.getRepository(Bid).create(body);
        const result = await AppDataSource.getRepository(Bid).save(bid);
        res.status(201).send({status: "201", message: `Bid Created Succesffuly for the auction ${req.body}`})
    } catch (err) {
        console.log("Error in Create Bid:: ",err)
    }
})

console.log("Application Running");
