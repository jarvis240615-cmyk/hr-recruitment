import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '2rem' }}>
    <h2 style={{
      fontSize: '1.1rem', fontWeight: 700, color: 'rgba(255,255,255,0.9)',
      marginBottom: '0.75rem', paddingBottom: '0.5rem',
      borderBottom: '1px solid rgba(59,130,246,0.3)',
      background: 'linear-gradient(135deg, #a78bfa, #3b82f6)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    }}>{title}</h2>
    <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem', lineHeight: 1.8 }}>
      {children}
    </div>
  </div>
);

const P = ({ children }) => <p style={{ marginBottom: '0.75rem' }}>{children}</p>;
const Ul = ({ items }) => (
  <ul style={{ paddingLeft: '1.5rem', marginBottom: '0.75rem' }}>
    {items.map((item, i) => (
      <li key={i} style={{ marginBottom: '0.35rem', color: 'rgba(255,255,255,0.65)' }}>{item}</li>
    ))}
  </ul>
);

export default function PrivacyPolicy() {
  return (
    <div style={{
      minHeight: '100vh', background: '#020817',
      fontFamily: 'Inter, system-ui, sans-serif', color: 'rgba(255,255,255,0.85)',
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem',
        background: 'rgba(10,15,40,0.8)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          ← Back
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontWeight: 700, background: 'linear-gradient(135deg, #a78bfa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          HR Recruitment Platform
        </span>
      </div>

      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Title */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '100px', padding: '0.3rem 0.9rem', marginBottom: '1rem',
            fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            🔒 Legal
          </div>
          <h1 style={{
            fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #ffffff, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem',
          }}>Privacy Policy</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            Last updated: March 29, 2025 &nbsp;·&nbsp; Effective: March 29, 2025
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(10,15,40,0.6)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
          <P>
            HR Recruitment Platform ("we", "us", or "our") is committed to protecting your personal information.
            This Privacy Policy explains how we collect, use, disclose, and safeguard data when you use our
            AI-powered recruitment platform. Please read this policy carefully.
          </P>

          <Section title="1. Information We Collect">
            <P>We collect information in the following categories:</P>
            <Ul items={[
              'Account data: name, email address, employer organisation, job title.',
              'Candidate data: resumes/CVs, cover letters, work history, skills, and contact details submitted through job applications.',
              'Usage data: pages visited, features used, session duration, and interaction logs.',
              'Device & technical data: IP address, browser type, operating system, and referral URL.',
              'Cookies and tracking technologies (see Section 4).',
            ]} />
          </Section>

          <Section title="2. AI Processing of Resumes">
            <P>
              Our platform uses artificial intelligence and machine learning to assist recruiters in evaluating
              candidate applications. This includes:
            </P>
            <Ul items={[
              'Automated resume parsing to extract skills, experience, and qualifications.',
              'AI-generated match scores comparing candidates to job requirements.',
              'Sentiment and keyword analysis to surface relevant information.',
              'Ranking and shortlisting suggestions based on configurable criteria.',
            ]} />
            <P>
              AI-generated scores and recommendations are <strong style={{ color: 'rgba(255,255,255,0.85)' }}>advisory only</strong>.
              Final hiring decisions are always made by human recruiters. Candidates may request a review of
              any automated decision by contacting <a href="mailto:privacy@hrplatform.io" style={{ color: '#60a5fa' }}>privacy@hrplatform.io</a>.
            </P>
          </Section>

          <Section title="3. How We Use Your Information">
            <Ul items={[
              'To operate, maintain, and improve the platform.',
              'To match candidates with suitable job openings.',
              'To facilitate communication between recruiters and candidates.',
              'To comply with legal obligations.',
              'To send transactional emails and, with consent, marketing communications.',
              'To detect and prevent fraud or abuse.',
            ]} />
          </Section>

          <Section title="4. Cookies">
            <P>We use the following types of cookies:</P>
            <Ul items={[
              'Essential cookies: required for authentication and core platform functionality.',
              'Analytics cookies: help us understand how users interact with the platform (e.g., page views, session length).',
              'Preference cookies: remember your settings and display preferences.',
            ]} />
            <P>
              You can manage or disable non-essential cookies through your browser settings. Note that
              disabling essential cookies may affect platform functionality.
            </P>
          </Section>

          <Section title="5. Data Sharing">
            <P>We do not sell your personal data. We may share data with:</P>
            <Ul items={[
              'Service providers: cloud infrastructure, analytics, and email delivery partners under strict data processing agreements.',
              'Employers: candidate data is shared with the recruiting organisation for the specific role applied to.',
              'Legal authorities: when required by law, regulation, or court order.',
              'Business transfers: in the event of a merger, acquisition, or sale of assets.',
            ]} />
          </Section>

          <Section title="6. Data Retention">
            <P>
              We retain personal data for as long as necessary to provide our services and comply with legal
              obligations. Candidate profiles are retained for 24 months after the last application activity,
              after which they are anonymised or deleted upon request.
            </P>
          </Section>

          <Section title="7. Your Rights">
            <P>Depending on your jurisdiction, you may have the right to:</P>
            <Ul items={[
              'Access the personal data we hold about you.',
              'Rectify inaccurate or incomplete data.',
              'Request deletion of your data ("right to be forgotten").',
              'Object to or restrict certain processing activities.',
              'Data portability — receive your data in a structured, machine-readable format.',
              'Withdraw consent at any time where processing is based on consent.',
            ]} />
            <P>
              To exercise these rights, contact us at{' '}
              <a href="mailto:privacy@hrplatform.io" style={{ color: '#60a5fa' }}>privacy@hrplatform.io</a>.
            </P>
          </Section>

          <Section title="8. Security">
            <P>
              We implement industry-standard security measures including TLS encryption in transit, AES-256
              encryption at rest, role-based access controls, and regular security audits. No method of
              transmission over the internet is 100% secure; we cannot guarantee absolute security.
            </P>
          </Section>

          <Section title="9. International Transfers">
            <P>
              Your data may be processed in countries outside your own. Where we transfer data internationally,
              we ensure appropriate safeguards are in place (such as Standard Contractual Clauses) to protect
              your information.
            </P>
          </Section>

          <Section title="10. Changes to This Policy">
            <P>
              We may update this Privacy Policy periodically. We will notify registered users by email and
              post the updated policy with a revised "last updated" date. Continued use of the platform after
              changes constitutes acceptance of the updated policy.
            </P>
          </Section>

          <Section title="11. Contact Us">
            <P>For privacy-related questions, requests, or complaints:</P>
            <div style={{
              background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
              borderRadius: '12px', padding: '1.25rem 1.5rem',
              color: 'rgba(255,255,255,0.75)', fontSize: '0.88rem', lineHeight: 1.7,
            }}>
              <strong style={{ color: 'rgba(255,255,255,0.9)' }}>HR Recruitment Platform — Privacy Team</strong><br />
              Email: <a href="mailto:privacy@hrplatform.io" style={{ color: '#60a5fa' }}>privacy@hrplatform.io</a><br />
              Response time: within 30 days of receiving your request.
            </div>
          </Section>
        </div>

        {/* Footer links */}
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
          {[{ to: '/about', label: 'About' }, { to: '/contact', label: 'Contact' }].map(({ to, label }) => (
            <Link key={to} to={to} style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
            >{label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
