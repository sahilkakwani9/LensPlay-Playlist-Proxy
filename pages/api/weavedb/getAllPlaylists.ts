import { NextApiRequest, NextApiResponse } from "next";
import WeaveDB from "weavedb-sdk-node";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.status(200).json({ message: "Method not allowed" });
    return;
  }
  try {
    const { profileId } = req.body;
    const contractTxId = process.env.CONTRACT_TXN_ID;
    const db = new WeaveDB({ contractTxId: contractTxId });
    await db.init();

    const data = await db.get(
      "Creators",
      ["profileId"],
      ["profileId", "==", profileId]
    );

    res.status(200).json({ data: data });
  } catch (error) {
    res.status(400).send("error " + error);
  }
}
