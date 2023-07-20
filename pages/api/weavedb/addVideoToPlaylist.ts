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
    const { profileId, playlistId, publicationId, name } = req.body;
    const contractTxId = process.env.CONTRACT_TXN_ID;
    const signer_wallet = process.env.SIGNER;
    const privateKey = process.env.WEAVE_KEY;
    const db = new WeaveDB({ contractTxId: contractTxId });
    await db.init();

    const isInPlaylist = await db.get(
      "Playlists",
      ["playlistId"],
      ["playlistId", "==", playlistId]
    );

    //if this is creator's new playlist
    if (isInPlaylist.length == 0) {
      console.log("new playlist");

      const result = await db.set(
        {
          profileId: profileId,
          playlistId: playlistId,
          publicationId: [publicationId],
          name: name,
        },
        "Playlists",
        playlistId,
        {
          wallet: signer_wallet,
          privateKey: privateKey,
        }
      );
      console.log(result);
    }
    //if creator has added video to new playlist
    else {
      console.log("playlist exists");
      console.log();

      const publicationIds = isInPlaylist[0].publicationId;

      publicationIds.push(publicationId);

      const result = await db.update(
        {
          publicationId: publicationIds,
        },
        "Playlists",
        playlistId,
        {
          wallet: signer_wallet,
          privateKey: privateKey,
        }
      );
      console.log(result);
    }

    res.status(200).send("Successfully added video");
  } catch (error) {
    res.status(400).send("error: " + error);
  }
}
