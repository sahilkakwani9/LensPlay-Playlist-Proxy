import { NextApiRequest, NextApiResponse } from "next";
import WeaveDB from "weavedb-sdk-node";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      res.status(200).json({ message: "Method not allowed" });
      return;
    }
    const { profileId, name, cover } = req.body;
    const contractTxId = process.env.CONTRACT_TXN_ID;
    const signer_wallet = process.env.SIGNER;
    const privateKey = process.env.WEAVE_KEY;
    const db = new WeaveDB({ contractTxId: contractTxId });
    await db.init();

    const isInCreators = await db.get(
      "Creators",
      ["profileId"],
      ["profileId", "==", profileId]
    );

    console.log(isInCreators);

    //if this is creator's first playlist
    if (isInCreators.length == 0) {
      console.log("no playlist");
      const result = await db.set(
        {
          profileId: profileId,
          playlist: [
            {
              playlistId: `${name}-${profileId}`,
              cover: cover,
              name: name,
            },
          ],
        },
        "Creators",
        profileId,
        {
          wallet: signer_wallet,
          privateKey: privateKey,
        }
      );
      console.log(result);
    }
    //if creator has created some playlist's before
    else {
      console.log("has playlist");

      const playlist = isInCreators[0].playlist;
      playlist.push({
        playlistId: `${name}-${profileId}`,
        cover: cover,
        name: name,
      });

      const result = await db.update(
        { playlist: playlist },
        "Creators",
        profileId,
        {
          wallet: signer_wallet,
          privateKey: privateKey,
        }
      );
      console.log(result);
    }

    res.status(200).send({ playlistId: `${name}-${profileId}` });
  } catch (error) {
    res.status(400).send("error: " + error);
  }
}
