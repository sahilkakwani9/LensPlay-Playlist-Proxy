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
    const { playlistId, publicationId } = req.body;
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
      res.status(400).json({ error: "Invalid PlaylistId" });
      return;
    }
    //if creator has added video to new playlist
    else {
      console.log("playlist exists");

      const publicationIds = isInPlaylist[0].publicationId;

      const newPublications = publicationIds.filter((id) => {
        return id != publicationId;
      });

      const result = await db.update(
        {
          publicationId: newPublications,
        },
        "Playlists",
        playlistId,
        {
          wallet: signer_wallet,
          privateKey: privateKey,
        }
      );
    }

    res.status(200).send("Successfully removed video");
  } catch (error) {
    res.status(400).send("error: " + error);
  }
}
