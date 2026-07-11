const createFlats = (blockLetter) =>
  Array.from({ length: 4 }, (_, floorIndex) =>
    Array.from(
      { length: 4 },
      (_, unitIndex) => `${blockLetter}-${floorIndex + 1}${String(unitIndex + 1).padStart(2, '0')}`,
    ),
  ).flat()

export const BLOCK_FLATS = Object.fromEntries(
  ['A', 'B', 'C', 'D', 'E'].map((block) => [`Block ${block}`, createFlats(block)]),
)

export const COMPLAINT_TYPES = {
  Individual: [
    'Flat Maintenance',
    'Utility Issues',
    'Neighbor Complaints',
    'Parking',
    'Pets',
    'Billing & Payments',
    'Housekeeping',
    'Personal Requests',
  ],
  Community: [
    'Water Supply',
    'Electricity',
    'Lift & Elevator',
    'Security',
    'Housekeeping & Cleanliness',
    'Common Area Maintenance',
    'Garden & Landscaping',
    'Clubhouse & Amenities',
    'Fire & Safety',
    'Pest Control',
    'Construction & Renovation',
    'Parking Area',
    'Waste Management',
    'Community Rules & Violations',
    'RWA & Administration',
    'Internet, Intercom & Communication',
    'Environment & Sustainability',
    'Events & Community Activities',
  ],
}

export const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed']

export const EMPTY_FILTERS = { search: '', block: '', status: '' }
