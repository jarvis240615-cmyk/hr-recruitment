import { Link } from 'react-router-dom';

const FeatureCard = ({ icon, title, description }) => (
  <div style={{
    background: 'rgba(10,15,40,0.5)', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px', padding: '1.5rem', transition: 'all 0.25s',
  }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'rgba(139,92,246,0.35)';
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = '0 12px 40px rgba(139,92,246,0.12)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{icon}</div>
    <div style={{ fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '0.4rem', fontSize: '0.95rem' }}>{title}</div>
    <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>{description}</div>
  </div>
);

const StatBadge = ({ value, label }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{
      fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.03em',
      background: 'linear-gradient(135deg, #a78bfa, #3b82f6)',
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    }}>{value}</div>
    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}>{label}</div>
  </div>
);

export default function About() {
  return (
    <div style={{ minHeight: '100vh', background: '#020817', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '1rem 2rem', display: 'flex', alignItems: 'center', gap: '1rem',
        background: 'rgba(10,15,40,0.8)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <Link to="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.85rem' }}>← Back</Link>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ fontWeight: 700, background: 'linear-gradient(135deg, #a78bfa, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          HR Recruitment Platform
        </span>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '24px', margin: '0 auto 1.5rem',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.2rem', boxShadow: '0 0 50px rgba(59,130,246,0.5)',
          }}>🚀</div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
            borderRadius: '100px', padding: '0.3rem 0.9rem', marginBottom: '1rem',
            fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            🤖 AI-Powered Recruitment
          </div>

          <h1 style={{
            fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #ffffff 30%, #a78bfa 70%, #3b82f6)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '1.25rem', lineHeight: 1.15,
          }}>
            Hire smarter with<br />artificial intelligence
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.5)', fontSize: '1rem', lineHeight: 1.75,
            maxWidth: '560px', margin: '0 auto 2rem',
          }}>
            HR Recruitment Platform is a modern, AI-powered hiring suite that helps teams source, evaluate,
            and hire the best talent — faster and more fairly than ever before.
          </p>

          {/* Stats */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap',
            background: 'rgba(10,15,40,0.5)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px', padding: '1.75rem', maxWidth: '480px', margin: '0 auto',
          }}>
            <StatBadge value="10×" label="Faster screening" />
            <StatBadge value="95%" label="Match accuracy" />
            <StatBadge value="40%" label="Time-to-hire reduction" />
          </div>
        </div>

        {/* Mission */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))',
          border: '1px solid rgba(139,92,246,0.2)', borderRadius: '20px',
          padding: '2.5rem', marginBottom: '3rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>🎯</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)', marginBottom: '0.75rem' }}>Our Mission</h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: '600px', margin: '0 auto' }}>
            We believe great hiring is the foundation of every great company. Our mission is to give every
            recruiting team — from startups to enterprises — the AI tools previously available only to the
            largest organisations, levelling the playing field in the global war for talent.
          </p>
        </div>

        {/* Features grid */}
        <h2 style={{
          fontSize: '1.4rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)',
          marginBottom: '1.5rem', textAlign: 'center',
        }}>What We Do</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
          <FeatureCard
            icon="🧠"
            title="AI Resume Screening"
            description="Our NLP engine parses and scores every resume against your job requirements in seconds, surfacing the strongest candidates instantly."
          />
          <FeatureCard
            icon="📊"
            title="Candidate Scorecards"
            description="Standardised, bias-reduced scorecards ensure fair, consistent evaluations across your entire hiring team."
          />
          <FeatureCard
            icon="🗂️"
            title="Visual Pipeline"
            description="Kanban-style recruitment pipelines give you a real-time overview of every candidate's status across all open roles."
          />
          <FeatureCard
            icon="📅"
            title="Interview Scheduling"
            description="Built-in slot picker integrates with your calendar to eliminate back-and-forth scheduling friction."
          />
          <FeatureCard
            icon="📈"
            title="Analytics & Insights"
            description="Track source performance, time-to-hire, diversity metrics, and funnel conversion rates with beautiful dashboards."
          />
          <FeatureCard
            icon="🔒"
            title="Privacy by Design"
            description="GDPR-compliant data handling, encrypted storage, and granular access controls protect your candidates' data."
          />
        </div>

        {/* How it works */}
        <div style={{
          background: 'rgba(10,15,40,0.6)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px',
          padding: '2.5rem', marginBottom: '3rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'rgba(255,255,255,0.9)', marginBottom: '2rem', textAlign: 'center' }}>
            How It Works
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {[
              { step: '01', title: 'Post a Job', desc: 'Create a detailed job posting with role requirements, skills, and criteria.' },
              { step: '02', title: 'Candidates Apply', desc: 'Applicants submit resumes and answers via your public-facing application portal.' },
              { step: '03', title: 'AI Screens & Scores', desc: 'Our AI parses every resume, extracts key attributes, and assigns match scores.' },
              { step: '04', title: 'Team Reviews', desc: 'Recruiters review AI-ranked shortlists, leave scorecard notes, and move candidates through stages.' },
              { step: '05', title: 'Schedule & Hire', desc: 'Built-in scheduling tools coordinate interviews; once decided, extend offers directly from the platform.' },
            ].map(({ step, title, desc }) => (
              <div key={step} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.25), rgba(139,92,246,0.25))',
                  border: '1px solid rgba(59,130,246,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 800, color: '#60a5fa', letterSpacing: '0.05em',
                }}>
                  {step}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'rgba(255,255,255,0.88)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{title}</div>
                  <div style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Questions or want to learn more?
          </p>
          <Link to="/contact" style={{
            display: 'inline-block', padding: '0.8rem 2rem',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            borderRadius: '12px', color: 'white', fontWeight: 700,
            textDecoration: 'none', fontSize: '0.92rem',
            boxShadow: '0 0 25px rgba(59,130,246,0.35)',
            transition: 'opacity 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Contact Us →
          </Link>
        </div>

        {/* Footer links */}
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '2.5rem', flexWrap: 'wrap' }}>
          {[{ to: '/contact', label: 'Contact' }, { to: '/privacy', label: 'Privacy Policy' }].map(({ to, label }) => (
            <Link key={to} to={to} style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontSize: '0.85rem' }}
              onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
            >{label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
