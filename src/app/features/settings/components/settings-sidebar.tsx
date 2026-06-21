import { ProjectIdentityHeader } from '@/app/components';
import { fetchConfigs } from '@/app/services/configs-api';
import { useAppStore } from '@/app/stores/app-store';
import { layout, space } from '@/app/styles/tokens';
import { ListItem } from '@dendelion/paper-ui';
import { useEffect, useState } from 'react';
import { SidebarSection } from '../../plans/components/sidebar-section';

export const SettingsSidebar = () => {
  const activeSection = useAppStore((s) => s.activeSettingsSection);
  const setActiveSection = useAppStore((s) => s.setActiveSettingsSection);
  const configFiles = useAppStore((s) => s.settingsConfigFiles);
  const setConfigFiles = useAppStore((s) => s.setSettingsConfigFiles);

  useEffect(() => {
    fetchConfigs().then(setConfigFiles);
  }, [setConfigFiles]);

  const divider = (
    <div style={{ height: 1, background: 'rgba(0,0,0,0.08)', margin: `${space[3]} ${space[3]}` }} />
  );

  return (
    <aside
      style={{
        width: layout.sidebarWidth,
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
      <div style={{ padding: `${space[5]} ${space[3]} ${space[4]}`, flexShrink: 0 }}>
        <ProjectIdentityHeader />
      </div>

      {divider}

      <div style={{ flex: 1, overflowY: 'auto', paddingTop: space[1] }}>
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
