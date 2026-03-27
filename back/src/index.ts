import express, { Request, Response } from 'express';

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'CpoolExpress TypeScript server is running',
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
