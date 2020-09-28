import { delete_records_upto, get_records } from '.';

// This needs to be a library, so i'm simply going to export a main function
// TODO: actually upload something.
export function main() {
  // While active, periodically grab stuff off the database
  setInterval(() => {
    get_records()
      .then(records => {
        // Upload records
        console.log('Uploading records', records);
        return records;
      })
      .then(records => {
        const last = records.length;
        if (last === 0) {
          return;
        }
        const lastId = records[last - 1].id;
        // Delete records
        console.log('Deleting records before id ' + lastId);
        return delete_records_upto(lastId);
      });
  }, 10000);
}
