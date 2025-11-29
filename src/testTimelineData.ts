
import { timelineData } from './data/timelineData';

const event = timelineData.find(e => e.id === "verdenshandel-for-oppdagelsesreisene");

if (event) {
    console.log("Found event:", event.title);
    console.log("Timeline events:", event.timeline);
} else {
    console.log("Event not found");
}
