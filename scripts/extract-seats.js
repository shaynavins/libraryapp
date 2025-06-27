const fs = require('fs');
const path = require('path');

// Read the SVG file
const svgPath = path.join(__dirname, '../assets/images/Frame 1 (1).svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Extract all circle elements with fill="#FF0000" (red seats)
const circleRegex = /<circle cx="([^"]+)" cy="([^"]+)" r="([^"]+)" fill="#FF0000"\/?>/g;
const seats = [];
let match;
let seatId = 1;

while ((match = circleRegex.exec(svgContent)) !== null) {
  const [, cx, cy, r] = match;
  seats.push({
    id: `S${seatId}`,
    occupied: false,
    userId: null,
    cx: parseFloat(cx),
    cy: parseFloat(cy),
    r: parseFloat(r)
  });
  seatId++;
}

console.log(`Found ${seats.length} seats in the SVG`);
console.log('\nSeat data for InteractiveSeatMap component:');
console.log('const defaultSeats: Seat[] = [');
seats.forEach((seat, index) => {
  const comma = index < seats.length - 1 ? ',' : '';
  console.log(`  { id: '${seat.id}', occupied: false, userId: null, cx: ${seat.cx}, cy: ${seat.cy}, r: ${seat.r} }${comma}`);
});
console.log('];');

// Save to a JSON file for easy import
const outputPath = path.join(__dirname, '../assets/seat-data.json');
fs.writeFileSync(outputPath, JSON.stringify(seats, null, 2));
console.log(`\nSeat data saved to: ${outputPath}`); 