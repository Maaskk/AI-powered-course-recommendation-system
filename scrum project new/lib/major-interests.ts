/**
 * Major to Interests Mapping
 * Interests are filtered based on selected major
 */

export const MAJOR_INTERESTS_MAP: Record<string, string[]> = {
  // Computer Science & IT
  "Computer Science": [
    "Web Development", "Frontend Development", "Backend Development", "Full Stack Development",
    "Mobile Development", "iOS Development", "Android Development",
    "Machine Learning", "Deep Learning", "Artificial Intelligence",
    "Data Science", "Data Analysis", "Data Visualization", "Big Data",
    "Cloud Computing", "AWS", "Azure", "Google Cloud",
    "DevOps", "Cybersecurity", "Network Security", "Ethical Hacking",
    "UI/UX Design", "Game Development", "Game Design",
    "Blockchain", "Cryptocurrency", "Smart Contracts",
    "IoT", "Internet of Things", "Robotics", "Embedded Systems",
  ],
  "Software Engineering": [
    "Web Development", "Full Stack Development", "Mobile Development",
    "DevOps", "Cloud Computing", "AWS", "Azure", "Google Cloud",
    "Agile", "Scrum", "Project Management",
    "Cybersecurity", "Software Architecture", "Design Patterns",
  ],
  "Data Science": [
    "Data Science", "Data Analysis", "Data Visualization", "Big Data",
    "Machine Learning", "Deep Learning", "Artificial Intelligence",
    "Statistics", "Mathematics", "Python", "R Programming",
    "Business Analytics", "Predictive Analytics",
  ],
  "Information Technology": [
    "Cloud Computing", "AWS", "Azure", "Google Cloud",
    "DevOps", "Cybersecurity", "Network Security",
    "System Administration", "Database Administration",
    "IT Management", "Project Management",
  ],
  "Cybersecurity": [
    "Cybersecurity", "Network Security", "Ethical Hacking",
    "Information Security", "Penetration Testing", "Cryptography",
    "Security Auditing", "Risk Management",
  ],

  // Engineering
  "Biomedical Engineering": [
    "Medical Devices", "Biotechnology", "Signal Processing",
    "Tissue Engineering", "Biomechanics", "Medical Imaging",
    "Clinical Research", "Regulatory Affairs",
  ],
  "Mechanical Engineering": [
    "CAD", "3D Modeling", "Manufacturing", "Product Design",
    "Thermodynamics", "Robotics", "Automotive Engineering",
    "Aerospace Engineering", "Materials Science",
  ],
  "Electrical Engineering": [
    "Electronics", "Circuits", "Embedded Systems", "Signal Processing",
    "Power Systems", "Control Systems", "IoT", "Robotics",
  ],
  "Civil Engineering": [
    "Structural Design", "Construction Management", "CAD",
    "Project Management", "Sustainability", "Environmental Engineering",
  ],
  "Chemical Engineering": [
    "Process Design", "Chemical Processes", "Materials Science",
    "Pharmaceuticals", "Environmental Engineering",
  ],
  "Aerospace Engineering": [
    "Aerodynamics", "Propulsion", "Aircraft Design", "Space Systems",
    "CAD", "3D Modeling", "Simulation",
  ],
  "Industrial Engineering": [
    "Operations Research", "Optimization", "Manufacturing",
    "Supply Chain Management", "Project Management", "Quality Control",
  ],
  "Environmental Engineering": [
    "Environmental Science", "Sustainability", "Renewable Energy",
    "Climate Change", "Water Treatment", "Pollution Control",
  ],

  // Business
  "Business Administration": [
    "Business Management", "Leadership", "Strategy", "Entrepreneurship",
    "Marketing", "Digital Marketing", "Finance", "Accounting",
    "Project Management", "Agile", "Scrum",
  ],
  "Business Management": [
    "Leadership", "Strategy", "Operations Management", "Project Management",
    "Business Analytics", "Organizational Behavior",
  ],
  "Marketing": [
    "Digital Marketing", "Social Media Marketing", "SEO", "Content Marketing",
    "Branding", "Advertising", "E-commerce", "Analytics",
  ],
  "Finance": [
    "Finance", "Investment", "Stock Trading", "Financial Planning",
    "Accounting", "Auditing", "Risk Management", "Banking",
  ],
  "Accounting": [
    "Accounting", "Financial Reporting", "Auditing", "Taxation",
    "Bookkeeping", "Financial Analysis",
  ],
  "Economics": [
    "Economics", "Statistics", "Mathematics", "Financial Analysis",
    "Market Research", "Econometrics", "Policy Analysis",
  ],
  "Entrepreneurship": [
    "Entrepreneurship", "Startups", "Business Planning", "Venture Capital",
    "Marketing", "Finance", "Leadership",
  ],
  "International Business": [
    "International Business", "Global Trade", "Cross-cultural Management",
    "Marketing", "Finance", "Language Learning",
  ],

  // Psychology
  "Psychology": [
    "Psychology", "Mental Health", "Counseling", "Therapy",
    "Research", "Statistics", "Neuroscience", "Behavioral Science",
  ],
  "Clinical Psychology": [
    "Clinical Psychology", "Therapy", "Counseling", "Mental Health",
    "Assessment", "Treatment Planning",
  ],
  "Cognitive Psychology": [
    "Cognitive Psychology", "Neuroscience", "Research", "Statistics",
    "Memory", "Learning", "Perception",
  ],

  // Sciences
  "Biology": [
    "Biology", "Genetics", "Molecular Biology", "Cell Biology",
    "Research", "Laboratory Techniques", "Statistics",
  ],
  "Molecular Biology": [
    "Molecular Biology", "Genetics", "DNA", "RNA", "Proteins",
    "Laboratory Techniques", "Research",
  ],
  "Biochemistry": [
    "Biochemistry", "Chemistry", "Proteins", "Enzymes", "Metabolism",
    "Laboratory Techniques", "Research",
  ],
  "Genetics": [
    "Genetics", "Genomics", "DNA", "Heredity", "Molecular Biology",
    "Research", "Statistics",
  ],
  "Chemistry": [
    "Chemistry", "Organic Chemistry", "Laboratory Techniques",
    "Research", "Analytical Chemistry",
  ],
  "Organic Chemistry": [
    "Organic Chemistry", "Chemical Reactions", "Synthesis",
    "Laboratory Techniques", "Research",
  ],
  "Physical Chemistry": [
    "Physical Chemistry", "Thermodynamics", "Quantum Mechanics",
    "Spectroscopy", "Research",
  ],
  "Mathematics": [
    "Mathematics", "Statistics", "Calculus", "Algebra", "Geometry",
    "Applied Mathematics", "Research",
  ],
  "Applied Mathematics": [
    "Applied Mathematics", "Modeling", "Optimization", "Numerical Methods",
    "Statistics", "Programming",
  ],
  "Statistics": [
    "Statistics", "Data Analysis", "Probability", "Regression",
    "Hypothesis Testing", "Research", "Mathematics",
  ],
  "Physics": [
    "Physics", "Quantum Mechanics", "Thermodynamics", "Electromagnetism",
    "Research", "Mathematics",
  ],
  "Theoretical Physics": [
    "Theoretical Physics", "Quantum Mechanics", "Relativity", "Particle Physics",
    "Mathematics", "Research",
  ],
  "Applied Physics": [
    "Applied Physics", "Engineering Physics", "Materials Science",
    "Research", "Mathematics",
  ],

  // Health & Medicine
  "Medicine": [
    "Medicine", "Clinical Research", "Anatomy", "Physiology",
    "Pharmacology", "Medical Devices", "Public Health",
  ],
  "Nursing": [
    "Nursing", "Patient Care", "Clinical Skills", "Medical Procedures",
    "Public Health", "Mental Health",
  ],
  "Pharmacy": [
    "Pharmacy", "Pharmaceuticals", "Drug Therapy", "Medication",
    "Clinical Research", "Chemistry",
  ],
  "Public Health": [
    "Public Health", "Epidemiology", "Health Policy", "Community Health",
    "Research", "Statistics",
  ],
  "Health Sciences": [
    "Health Sciences", "Medical Research", "Public Health",
    "Clinical Research", "Statistics",
  ],

  // Design & Arts
  "Graphic Design": [
    "Graphic Design", "UI/UX Design", "User Interface Design",
    "User Experience Design", "Photoshop", "Illustrator", "Creative",
  ],
  "Industrial Design": [
    "Industrial Design", "Product Design", "3D Modeling", "CAD",
    "Manufacturing", "Ergonomics",
  ],
  "Fashion Design": [
    "Fashion Design", "Textiles", "Style", "Trends", "Creative",
  ],
  "Architecture": [
    "Architecture", "Building Design", "CAD", "3D Modeling",
    "Urban Planning", "Sustainability",
  ],

  // Communications & Media
  "Communications": [
    "Communications", "Media Studies", "Journalism", "Public Relations",
    "Writing", "Social Media Marketing",
  ],
  "Journalism": [
    "Journalism", "News Reporting", "Writing", "Media Ethics",
    "Research", "Public Relations",
  ],
  "Media Studies": [
    "Media Studies", "Communication Theory", "Digital Media",
    "Video Production", "Content Creation",
  ],

  // Humanities
  "English Literature": [
    "English Literature", "Writing", "Creative Writing", "Poetry",
    "Literary Analysis", "Research",
  ],
  "History": [
    "History", "Historical Research", "Writing", "Research",
    "Cultural Studies",
  ],
  "Political Science": [
    "Political Science", "Government", "Policy", "International Relations",
    "Research", "Writing",
  ],
  "Sociology": [
    "Sociology", "Social Research", "Statistics", "Research",
    "Cultural Studies", "Social Issues",
  ],
  "Anthropology": [
    "Anthropology", "Cultural Studies", "Research", "Archaeology",
    "Ethnography",
  ],
  "Philosophy": [
    "Philosophy", "Ethics", "Logic", "Metaphysics", "Research", "Writing",
  ],

  // Education
  "Education": [
    "Education", "Teaching", "Pedagogy", "Curriculum", "Learning",
    "Education Technology",
  ],
  "Early Childhood Education": [
    "Early Childhood Education", "Teaching", "Child Development",
    "Pedagogy", "Learning",
  ],
  "Special Education": [
    "Special Education", "Teaching", "Learning Support", "Pedagogy",
  ],

  // Law & Justice
  "Law": [
    "Law", "Legal Research", "Jurisprudence", "Contracts",
    "Criminal Law", "Writing", "Research",
  ],
  "Criminal Justice": [
    "Criminal Justice", "Law Enforcement", "Criminology", "Research",
  ],

  // Social Work
  "Social Work": [
    "Social Work", "Counseling", "Community Services", "Social Services",
    "Mental Health", "Research",
  ],

  // Arts
  "Art": [
    "Art", "Painting", "Drawing", "Sculpture", "Visual Arts", "Creative",
  ],
  "Music": [
    "Music", "Music Production", "Composition", "Performance", "Theory",
  ],
  "Theater": [
    "Theater", "Drama", "Acting", "Performance", "Creative",
  ],
  "Film Studies": [
    "Film Studies", "Cinema", "Video Production", "Directing", "Creative",
  ],

  // Other
  "Other": [
    "Research", "Academic Writing", "Statistics", "Mathematics",
    "Learning", "Career Development",
  ],
}

export function getInterestsForMajor(major: string): string[] {
  return MAJOR_INTERESTS_MAP[major] || MAJOR_INTERESTS_MAP["Other"]
}
