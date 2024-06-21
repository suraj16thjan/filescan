import NodeClam from "clamscan";

const clamScan = await new NodeClam().init({
    preference: "clamdscan",
    scanRecursively: false,
    clamscan: {
      path: '/opt/homebrew/bin/clamscan', // Path to clamscan binary on your server
      db: null, // Path to a custom virus definition database
      scanArchives: true, // If true, scan archives (ex. zip, rar, tar, dmg, iso, etc...)
      active: true // If true, this module will consider using the clamscan binary
    },
    // clamdscan: {
    // //  multiscan: true,
    //   // socket: "/var/run/clamav/clamd.ctl",
    // },
  });

  export const fileScan = async (localDiskFilePath:string) => await clamScan.scanFile(localDiskFilePath);