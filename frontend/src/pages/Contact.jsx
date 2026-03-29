import { useState } from 'react';
import { Link } from 'react-router-dom';

const ContactCard = ({ icon, title, subtitle, value, href }) => (
  <a
    href={href}
    style={{
      display: 'flex', alignItems: 'flex-start', gap: '1rem',
      background: 'rgba(10,15,40,0.6)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px',
      padding: '1.5rem', textDecoration: 'none', transition: 'all 0.25s',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'rgba(59,130,246,0.35)';
      e.currentTarget.style.boxShadow = '0 8px 30px rgba(59,130,246,0.15)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
  >
    <div style={{
      width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
      background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))',
      border: '1px solid rgba(59,130,246,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', marginBottom: '0.2rem' }}>{title}</div>
      <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.35rem' }}>{subtitle}</div>
      <div style={{ fontSize: '0.88rem', color: '#60a5fa' }}>{value}</div>
    </div>
  </a>
);

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState('');

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Opens native mail client as fallback; replace with API call in production
    const mailto = `mailto:support@hrplatform.io?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`;
    window.location.href = mailto;
    setSent(true);
  };

  const fieldStyle = (name) => ({
    width: '100%', padding: '0.75rem 1rem', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${focused === name ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '10px', color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem',
    outline: 'none', transition: 'all 0.25s',
    boxShadow: focused === name ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none',
  });

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

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '3rem 2rem' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '100px', padding: '0.3rem 0.9rem', marginBottom: '1rem',
            fontSize: '0.75rem', color: '#60a5fa', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            💬 Get in Touch
          </div>
          <h1 style={{
            fontSize: '2.2rem', fontWeight: 900, letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #ffffff, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '0.75rem',
          }}>Contact Us</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto' }}>
            Have a question, feedback, or need support? We'd love to hear from you.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Contact cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <ContactCard
              icon="📧"
              title="Email Support"
              subtitle="General questions & support"
              value="support@hrplatform.io"
              href="mailto:support@hrplatform.io"
            />
            <ContactCard
              icon="🔒"
              title="Privacy & Data"
              subtitle="Data requests & privacy concerns"
              value="privacy@hrplatform.io"
              href="mailto:privacy@hrplatform.io"
            />
            <ContactCard
              icon="💼"
              title="Sales & Partnerships"
              subtitle="Enterprise plans & integrations"
              value="sales@hrplatform.io"
              href="mailto:sales@hrplatform.io"
            />

            <div style={{
              background: 'rgba(10,15,40,0.4)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '16px', padding: '1.5rem',
            }}>
              <div style={{ fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>⏱ Response Times</div>
              {[
                ['Support enquiries', '< 24 hours'],
                ['Privacy requests', '< 30 days'],
                ['Sales enquiries', '< 48 hours'],
              ].map(([label, time]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.83rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
                  <span style={{ color: '#60a5fa', fontWeight: 600 }}>{time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact form */}
          <div style={{
            background: 'rgba(10,15,40,0.6)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <div style={{ fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem' }}>Message sent!</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>We'll get back to you shortly.</div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginBottom: '1.5rem', fontSize: '1rem' }}>Send a message</div>
                {[
                  { name: 'name', label: 'Your Name', placeholder: 'Jane Smith', type: 'text' },
                  { name: 'email', label: 'Email Address', placeholder: 'jane@company.com', type: 'email' },
                  { name: 'subject', label: 'Subject', placeholder: 'How can we help?', type: 'text' },
                ].map(({ name, label, placeholder, type }) => (
                  <div key={name} style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {label}
                    </label>
                    <input
                      type={type} name={name} value={form[name]} onChange={handleChange}
                      onFocus={() => setFocused(name)} onBlur={() => setFocused('')}
                      placeholder={placeholder} required
                      style={fieldStyle(name)}
                    />
                  </div>
                ))}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.45)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Message
                  </label>
                  <textarea
                    name="message" value={form.message} onChange={handleChange}
                    onFocus={() => setFocused('message')} onBlur={() => setFocused('')}
                    placeholder="Tell us more..." required rows={4}
                    style={{ ...fieldStyle('message'), resize: 'vertical', minHeight: '100px' }}
                  />
                </div>
                <button type="submit" style={{
                  width: '100%', padding: '0.85rem',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  border: 'none', borderRadius: '12px', color: 'white',
                  fontWeight: 700, fontSize: '0.92rem', cursor: 'pointer',
                  boxShadow: '0 0 25px rgba(59,130,246,0.4)',
                  transition: 'all 0.25s',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Send Message →
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer links */}
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '2.5rem', flexWrap: 'wrap' }}>
          {[{ to: '/about', label: 'About' }, { to: '/privacy', label: 'Privacy Policy' }].map(({ to, label }) => (
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
