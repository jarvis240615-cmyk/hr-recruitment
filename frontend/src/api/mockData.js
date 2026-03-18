export const mockJobs = [
  { id: 1, title: 'Senior Frontend Engineer', department: 'Engineering', location: 'Remote', type: 'Full-time', status: 'open', applicants: 24, posted: '2026-02-15', salary: '$140k–$180k', description: 'We are looking for a Senior Frontend Engineer to join our growing team. You will lead the development of our customer-facing web applications using React and TypeScript.' },
  { id: 2, title: 'Product Manager', department: 'Product', location: 'New York, NY', type: 'Full-time', status: 'open', applicants: 18, posted: '2026-02-20', salary: '$130k–$160k', description: 'Seeking an experienced Product Manager to drive product strategy and roadmap for our SaaS platform.' },
  { id: 3, title: 'UX Designer', department: 'Design', location: 'San Francisco, CA', type: 'Full-time', status: 'open', applicants: 12, posted: '2026-03-01', salary: '$120k–$150k', description: 'Join our design team to create intuitive and beautiful user experiences across our product suite.' },
  { id: 4, title: 'DevOps Engineer', department: 'Engineering', location: 'Remote', type: 'Full-time', status: 'closed', applicants: 9, posted: '2026-01-10', salary: '$130k–$170k', description: 'We need a DevOps Engineer to build and maintain our CI/CD pipelines and cloud infrastructure on AWS.' },
  { id: 5, title: 'Marketing Intern', department: 'Marketing', location: 'Austin, TX', type: 'Internship', status: 'open', applicants: 31, posted: '2026-03-05', salary: '$25/hr', description: 'Summer internship opportunity for a motivated marketing student to gain hands-on experience in digital marketing.' },
];

export const mockCandidates = [
  { id: 1, name: 'Alice Chen', email: 'alice@example.com', jobId: 1, jobTitle: 'Senior Frontend Engineer', stage: 'Interview', aiScore: 92, appliedDate: '2026-02-18', source: 'LinkedIn', resumeUrl: '#', phone: '555-0101', skills: ['React', 'TypeScript', 'GraphQL'], aiReasoning: 'Strong match: 7+ years React experience, led frontend team at previous company, TypeScript expert. Open source contributions to major React libraries.' },
  { id: 2, name: 'Bob Martinez', email: 'bob@example.com', jobId: 1, jobTitle: 'Senior Frontend Engineer', stage: 'Screening', aiScore: 78, appliedDate: '2026-02-20', source: 'Indeed', resumeUrl: '#', phone: '555-0102', skills: ['React', 'JavaScript', 'CSS'], aiReasoning: 'Good match: 4 years React experience, solid portfolio. Missing TypeScript experience but shows willingness to learn.' },
  { id: 3, name: 'Carol Williams', email: 'carol@example.com', jobId: 2, jobTitle: 'Product Manager', stage: 'Offer', aiScore: 95, appliedDate: '2026-02-22', source: 'Referral', resumeUrl: '#', phone: '555-0103', skills: ['Product Strategy', 'Agile', 'SQL'], aiReasoning: 'Excellent match: 8 years PM experience at top-tier SaaS companies. MBA from Wharton. Led products with $50M+ ARR.' },
  { id: 4, name: 'David Kim', email: 'david@example.com', jobId: 1, jobTitle: 'Senior Frontend Engineer', stage: 'Applied', aiScore: 65, appliedDate: '2026-03-01', source: 'Website', resumeUrl: '#', phone: '555-0104', skills: ['Vue.js', 'JavaScript', 'HTML'], aiReasoning: 'Moderate match: 3 years frontend experience but primarily with Vue.js. Would need React ramp-up time.' },
  { id: 5, name: 'Eva Johnson', email: 'eva@example.com', jobId: 3, jobTitle: 'UX Designer', stage: 'Interview', aiScore: 88, appliedDate: '2026-03-03', source: 'Dribbble', resumeUrl: '#', phone: '555-0105', skills: ['Figma', 'User Research', 'Prototyping'], aiReasoning: 'Strong match: 5 years UX experience, impressive portfolio with consumer apps. Experience with design systems.' },
  { id: 6, name: 'Frank Lee', email: 'frank@example.com', jobId: 2, jobTitle: 'Product Manager', stage: 'Screening', aiScore: 72, appliedDate: '2026-03-04', source: 'LinkedIn', resumeUrl: '#', phone: '555-0106', skills: ['Product Management', 'Data Analysis', 'Jira'], aiReasoning: 'Decent match: 3 years PM experience at a startup. Lacks enterprise SaaS experience but strong analytical skills.' },
  { id: 7, name: 'Grace Park', email: 'grace@example.com', jobId: 5, jobTitle: 'Marketing Intern', stage: 'Applied', aiScore: 81, appliedDate: '2026-03-06', source: 'University', resumeUrl: '#', phone: '555-0107', skills: ['Social Media', 'Content Writing', 'Analytics'], aiReasoning: 'Good match: Marketing major with strong GPA. Previous internship at a digital agency. Active social media presence.' },
  { id: 8, name: 'Henry Nguyen', email: 'henry@example.com', jobId: 4, jobTitle: 'DevOps Engineer', stage: 'Rejected', aiScore: 45, appliedDate: '2026-01-15', source: 'Indeed', resumeUrl: '#', phone: '555-0108', skills: ['Linux', 'Bash', 'Docker'], aiReasoning: 'Weak match: Junior-level DevOps skills. No experience with cloud providers or CI/CD pipelines at scale.' },
];

export const mockStages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

export const mockActivity = [
  { id: 1, text: 'Alice Chen moved to Interview stage', time: '2 hours ago', type: 'stage' },
  { id: 2, text: 'New application from David Kim for Senior Frontend Engineer', time: '5 hours ago', type: 'application' },
  { id: 3, text: 'Carol Williams received offer for Product Manager', time: '1 day ago', type: 'offer' },
  { id: 4, text: 'Marketing Intern position posted', time: '2 days ago', type: 'job' },
  { id: 5, text: 'Eva Johnson scheduled for interview', time: '3 days ago', type: 'interview' },
];

export const mockTimeToHire = [
  { stage: 'Applied', days: 0 },
  { stage: 'Screening', days: 3 },
  { stage: 'Interview', days: 10 },
  { stage: 'Offer', days: 18 },
  { stage: 'Hired', days: 24 },
];

export const mockFunnelData = [
  { stage: 'Applied', count: 120 },
  { stage: 'Screening', count: 80 },
  { stage: 'Interview', count: 35 },
  { stage: 'Offer', count: 12 },
  { stage: 'Hired', count: 8 },
];

export const mockSourceData = [
  { source: 'LinkedIn', count: 45 },
  { source: 'Indeed', count: 30 },
  { source: 'Referral', count: 25 },
  { source: 'Website', count: 15 },
  { source: 'University', count: 5 },
];

export const mockEmailTemplates = [
  { id: 1, name: 'Interview Invitation', subject: 'Interview Invitation – {{jobTitle}}', body: 'Dear {{name}},\n\nThank you for your application for the {{jobTitle}} position. We would like to invite you for an interview.\n\nPlease let us know your availability.\n\nBest regards,\nHR Team' },
  { id: 2, name: 'Offer Letter', subject: 'Offer Letter – {{jobTitle}}', body: 'Dear {{name}},\n\nWe are pleased to offer you the position of {{jobTitle}}.\n\nPlease review the attached offer details and let us know your decision.\n\nBest regards,\nHR Team' },
  { id: 3, name: 'Rejection', subject: 'Application Update – {{jobTitle}}', body: 'Dear {{name}},\n\nThank you for your interest in the {{jobTitle}} position. After careful consideration, we have decided to move forward with other candidates.\n\nWe wish you the best in your job search.\n\nBest regards,\nHR Team' },
  { id: 4, name: 'Shortlist', subject: 'Great News – {{jobTitle}} Application', body: 'Dear {{name}},\n\nWe are pleased to inform you that your application for the {{jobTitle}} position has been shortlisted.\n\nOur team was impressed with your qualifications, and we would like to move forward with the next steps in our recruitment process.\n\nWe will be in touch shortly with more details.\n\nBest regards,\nHR Team' },
];

export const mockInterviewSlots = [
  { date: '2026-03-18', slots: ['9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM'] },
  { date: '2026-03-19', slots: ['9:00 AM', '11:00 AM', '1:00 PM', '4:00 PM'] },
  { date: '2026-03-20', slots: ['10:00 AM', '2:00 PM', '3:00 PM'] },
  { date: '2026-03-21', slots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM'] },
  { date: '2026-03-24', slots: ['9:00 AM', '10:00 AM', '1:00 PM', '3:00 PM'] },
];
