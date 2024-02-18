import express from 'express';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import cors from 'cors';
import { CircleTransaction, CoinPrice } from './db';

const PORT = process.env.PORT || 5000;
const app = express();
app.use(helmet()); // Security
app.disable('x-powered-by');
app.use(cors());
app.use(bodyParser.json()) // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

const defaultresult = {
    'result': {
        'isValid': false
    }
}


app.get('/verification', (req: any, res: any) => {

    try {

        const address: string = req.query.address! as string;
        const times = req.query.times! ? req.query.times! : 1;
        const from = req.query.from! ? req.query.from! : '';
        const to = req.query.to! ? req.query.to! : '';

        if (address) {

            const matchStage: any = {};

            if (from !== '') {
                matchStage.originalDomain = parseInt(from);
            }
            if (to !== '') {
                matchStage.destinationDomain = parseInt(to);
            }

            const pipeline = [
                {
                    $match: matchStage
                },
                {
                    $group: {
                        _id: "$sender", // Group by sender
                        count: { $sum: 1 } // Count documents in each group
                    }
                }
            ];

            CircleTransaction.aggregate(pipeline)
                .then(result => {
                    const entry = result.find(entry => entry._id.toLowerCase() == address.toLowerCase());
                    if(entry && entry.count >= Number(times)){
                        res.status(200).json({
                            'result': {
                                'isValid': true
                            }
                        });
                    }else{
                        res.status(200).json(defaultresult);
                    }
                })
                .catch((error: { message: string } | any) => {
                    console.log("Request error:", error)

                    res.status(200).json(defaultresult);
                })

        } else {
            res.status(200).json(defaultresult);
        }

    } catch (error: { message: string } | any) {

        console.log("Request error:", error)

        res.status(200).json(defaultresult)

    }

});


// ONLY 200 is allowed
app.use((req: any, res: any, next: any) => {
    res.status(200).json(defaultresult)
});

app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(200).json(defaultresult);
});


app.listen(PORT, () => {
    console.log(`Listening on PORT: ${PORT}`);
    console.log('Time:', new Date())
})