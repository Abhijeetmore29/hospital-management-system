import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { isSignatureImage } from '../utils/signature';
import { isImageDataUrl } from '../utils/imageData';

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read signature file'));
    reader.readAsDataURL(file);
  });
}

export function DoctorProfile() {
  const { user, refreshUser } = useAuth();
  const [signature, setSignature] = useState(user?.signature || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setSignature(user?.signature || '');
    setProfilePicture(user?.profilePicture || '');
  }, [user]);

  async function handleFileChange(event, target) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (target === 'signature') {
        setSignature(String(dataUrl));
      } else {
        setProfilePicture(String(dataUrl));
      }
      setMessage('');
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await api.updateMe({ signature, profilePicture });
      await refreshUser();
      setMessage('Profile updated successfully.');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  function clearSignature() {
    setSignature('');
  }

  function clearProfilePicture() {
    setProfilePicture('');
  }

  return (
    <div className="stack">
      <PageHeader
        title="Doctor Profile"
        subtitle="Upload a signature image to use on printable prescriptions and surgery sheets."
      />

      <section className="panel profile-panel">
        <div className="profile-summary">
          <div>
            <span>Name</span>
            <strong>{user?.name}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{user?.email}</strong>
          </div>
          <div>
            <span>Role</span>
            <strong>{user?.role}</strong>
          </div>
        </div>

        <div className="profile-grid">
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="profile-media-grid">
              <label>
                <span>Profile Picture</span>
                <input type="file" accept="image/*" onChange={(event) => handleFileChange(event, 'picture')} />
              </label>
              <label>
                <span>Signature Image</span>
                <input type="file" accept="image/*" onChange={(event) => handleFileChange(event, 'signature')} />
              </label>
            </div>
            <p className="muted">
              Upload a profile photo for identification and a handwritten signature for print layouts.
            </p>
            <div className="actions-row">
              <button type="button" className="secondary-button" onClick={clearProfilePicture}>
                Clear Picture
              </button>
              <button type="button" className="secondary-button" onClick={clearSignature}>
                Clear Signature
              </button>
              <button className="primary-button" type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
            {message ? <p className="form-message">{message}</p> : null}
          </form>

          <div className="profile-preview-stack">
            <div className="signature-card">
              <span>Current Picture</span>
              {profilePicture ? (
                isImageDataUrl(profilePicture) ? (
                  <img className="profile-picture" src={profilePicture} alt="Doctor profile preview" />
                ) : (
                  <div className="signature-text">{profilePicture}</div>
                )
              ) : (
                <div className="signature-empty">No profile picture uploaded yet.</div>
              )}
            </div>

            <div className="signature-card">
              <span>Current Signature</span>
              {signature ? (
                isSignatureImage(signature) ? (
                  <img className="signature-image" src={signature} alt="Doctor signature preview" />
                ) : (
                  <div className="signature-text">{signature}</div>
                )
              ) : (
                <div className="signature-empty">No signature uploaded yet.</div>
              )}
            </div>
          </div>

          <div className="profile-avatar-note">
            <span className="muted">Preview in header</span>
            {profilePicture && isImageDataUrl(profilePicture) ? (
              <img className="profile-avatar" src={profilePicture} alt="Doctor avatar preview" />
            ) : (
              <div className="profile-avatar profile-avatar-fallback">{user?.name?.slice(0, 2)?.toUpperCase() || 'DR'}</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
