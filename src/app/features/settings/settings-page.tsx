import { PageTitle } from '@/app/components/page-title';
import { useProjectIdentity } from '@/app/hooks';
import { fetchConfig } from '@/app/services/config-api';
import { fetchConfigFile } from '@/app/services/configs-api';
import { uploadIcon } from '@/app/services/icon-api';
import { useAppStore } from '@/app/stores/app-store';
import { color, space } from '@/app/styles/tokens';
import type { PaperCampConfig } from '@/types/index';
import { Alert, Button, Card, CodeBlock, Stamp } from '@dendelion/paper-ui';
import { useEffect, useRef, useState } from 'react';

const GeneralSection = () => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [config, setConfig] = useState<PaperCampConfig | null | undefined>(undefined);
  const { iconDataUri: fetchedIconDataUri, loading: identityLoading } = useProjectIdentity();
  const [uploadedIconDataUri, setUploadedIconDataUri] = useState<string | null>(null);
  const iconDataUri = uploadedIconDataUri ?? fetchedIconDataUri;
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchConfig().then(setConfig);
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUri = reader.result as string;
      const ok = await uploadIcon(dataUri);
      setSaving(false);
      if (ok) {
        setSaved(true);
        setUploadedIconDataUri(dataUri);
        setTimeout(() => setSaved(false), 2000);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div style={{ marginBottom: space[6] }}>
        <h2 style={{ margin: 0 }}>Project Info</h2>
      </div>
      {config === undefined && <p>Loading…</p>}
      {config === null && (
        <Alert variant="warning" title="No .paper-camp/config.json found">
          Run <code>paper-camp init</code> in this directory first.
        </Alert>
      )}
      {config && (
        <Card accent accentColor="slate">
          <div style={{ display: 'flex', alignItems: 'center', gap: space[3] }}>
            <h2 style={{ margin: 0 }}>{config.projectName}</h2>
            <Stamp
              size="small"
              fillColor="rgba(143, 185, 150, 0.25)"
              textColor={color.accentGreenDark}
            >
              v{config.version}
            </Stamp>
          </div>
          <p>
            <strong>Initialized:</strong> {new Date(config.initializedAt).toLocaleString()}
          </p>
        </Card>
      )}

      <div style={{ marginTop: space[8] }}>
        <h3 style={{ marginBottom: space[3] }}>Project Icon</h3>
        <Card>
          <div className="flex items-center gap-4">
            {iconDataUri && (
              <img
                src={iconDataUri}
                alt="Project icon"
                style={{ width: 56, height: 56, objectFit: 'contain', flexShrink: 0 }}
              />
            )}
            <div>
              {/* paper-ui has no file-input component, so this raw input is intentional */}
              <input
                ref={fileRef}
                type="file"
                accept=".svg,.png,.jpg,.jpeg,.gif,.webp"
                onChange={handleFile}
                style={{ display: 'none' }}
              />
              <Button
                variant="secondary"
                size="small"
                onClick={() => fileRef.current?.click()}
                disabled={saving}
              >
                {saving ? 'Uploading…' : 'Choose File'}
              </Button>
              {saved && (
                <span className="text-sm" style={{ opacity: 0.6, marginLeft: space[2] }}>
                  Saved
                </span>
              )}
              {identityLoading && (
                <p className="text-sm" style={{ opacity: 0.5, margin: `${space[1]} 0 0` }}>
                  Loading…
                </p>
              )}
              {!identityLoading && !iconDataUri && !saving && (
                <p className="text-sm" style={{ opacity: 0.45, margin: `${space[1]} 0 0` }}>
                  No icon set. Upload an SVG, PNG, or JPG.
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const ConfigEditorSection = ({ fileName }: { fileName: string }) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchConfigFile(fileName).then((c) => {
      setContent(c);
      setLoading(false);
    });
  }, [fileName]);

  if (loading) return <p>Loading…</p>;
  if (content === null) {
    return (
      <Alert variant="warning" title="Could not load file">
        {fileName} not found.
      </Alert>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: space[4],
        }}
      >
        <h2 style={{ margin: 0 }}>{fileName}</h2>
      </div>
      <CodeBlock code={content} filename={fileName} />
    </div>
  );
};

export const SettingsPage = () => {
  const activeSection = useAppStore((s) => s.activeSettingsSection);

  return (
    <div>
      <PageTitle>Settings</PageTitle>
      {activeSection === 'general' && <GeneralSection />}
      {activeSection.startsWith('config:') && (
        <ConfigEditorSection fileName={activeSection.slice('config:'.length)} />
      )}
    </div>
  );
};
