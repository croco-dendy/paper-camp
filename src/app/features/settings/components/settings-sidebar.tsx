import { fetchConfigs } from '@/app/services/configs-api';
import { fetchIconDataUri } from '@/app/services/icon-api';
import { fetchPackageName } from '@/app/services/package-api';
import { useAppStore } from '@/app/stores/app-store';
import { FolderIcon, Icon, ListItem } from '@dendelion/paper-ui';
import { useEffect, useState } from 'react';
import { SidebarSection } from '../../plans/components/sidebar-section';

const kebabToTitle = (s: string) =>
  s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const SettingsSidebar = () => {
  const activeSection = useAppStore((s) => s.activeSettingsSection);
  const setActiveSection = useAppStore((s) => s.setActiveSettingsSection);
  const configFiles = useAppStore((s) => s.settingsConfigFiles);
  const setConfigFiles = useAppStore((s) => s.setSettingsConfigFiles);

  const [projectName, setProjectName] = useState<string | null>(null);
  const [iconDataUri, setIconDataUri] = useState<string | null>(null);

  useEffect(() => {
    fetchPackageName().then((name) => {
      if (name) setProjectName(kebabToTitle(name));
    });
    fetchIconDataUri().then(setIconDataUri);
    fetchConfigs().then(setConfigFiles);
  }, [setConfigFiles]);

  const divider = (
    <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', margin: '0.75rem 0.75rem' }} />
  );

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        height: '100%',
        position: 'sticky',
        top: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '1.25rem 0.75rem 1rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {iconDataUri ? (
            <img src={iconDataUri} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
          ) : (
            <Icon icon={<FolderIcon />} size="small" />
          )}
          <span
            style={{
              fontFamily: 'Luminari, "Cormorant Garamond", Georgia, serif',
              fontWeight: 600,
              fontSize: '1.25rem',
            }}
          >
            {projectName ?? 'Paper Camp'}
          </span>
        </div>
      </div>

      {divider}

      <div style={{ flex: 1, overflowY: 'auto', paddingTop: '0.25rem' }}>
        <SidebarSection label="General">
          <ListItem
            size="small"
            active={activeSection === 'general'}
            onClick={() => setActiveSection('general')}
          >
            Project Info
          </ListItem>
        </SidebarSection>

        {configFiles.length > 0 && (
          <SidebarSection label="Config Files">
            {configFiles.map((name) => (
              <ListItem
                key={name}
                size="small"
                active={activeSection === `config:${name}`}
                onClick={() => setActiveSection(`config:${name}`)}
              >
                {name}
              </ListItem>
            ))}
          </SidebarSection>
        )}
      </div>
    </aside>
  );
};
