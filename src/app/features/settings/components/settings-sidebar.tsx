import { fetchConfigs } from '@/app/services/configs-api';
import { useAppStore } from '@/app/stores/app-store';
import { ListItem } from '@dendelion/paper-ui';
import { useEffect } from 'react';
import { SidebarSection } from '../../plans/components/sidebar-section';

export const SettingsSidebar = () => {
  const activeSection = useAppStore((s) => s.activeSettingsSection);
  const setActiveSection = useAppStore((s) => s.setActiveSettingsSection);
  const configFiles = useAppStore((s) => s.settingsConfigFiles);
  const setConfigFiles = useAppStore((s) => s.setSettingsConfigFiles);

  useEffect(() => {
    fetchConfigs().then(setConfigFiles);
  }, [setConfigFiles]);

  return (
    <>
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
    </>
  );
};
