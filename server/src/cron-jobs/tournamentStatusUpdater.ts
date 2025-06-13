import cron from 'node-cron';
import { Tournament } from '../models/Tournament'; // Adjust path as needed

// Runs every day at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
  try {
    console.log('Running tournament status update cron job...');

    const now = new Date();

    // Find tournaments that are open/upcoming and past deadline
    const tournamentsToUpdate = await Tournament.find({
      registrationDeadline: { $lt: now },
      status: { $in: ['open'] }
    });

    for (const tournament of tournamentsToUpdate) {
      tournament.status = 'closed';
      await tournament.save();
      console.log(`Updated tournament "${tournament.title}" to status "closed"`);
    }

    console.log('Tournament status update job completed.');
  } catch (err) {
    console.error('Error in tournament status update job:', err);
  }
});
