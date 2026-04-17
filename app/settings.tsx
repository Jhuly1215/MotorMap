import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';
import { Spacing } from '../constants/Spacing';
import { useAppState } from '../context/AppStateContext';
import {
  ChevronLeft,
  Volume2,
  Globe,
  Info,
  ShieldCheck,
  LogOut,
  ChevronRight,
  Database
} from 'lucide-react-native';
import { Card } from '../components/ui/Card';

export default function SettingsScreen() {
  const router = useRouter();
  const { state, updateSettings } = useAppState();

  const toggleSound = () => {
    updateSettings({ soundEnabled: !state.settings.soundEnabled });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={32} color={Colors.text.dark} />
        </TouchableOpacity>
        <Text style={styles.title}>Configuración</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Preferencias</Text>

        <Card style={styles.optionCard}>
          <View style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <View style={[styles.iconBox, { backgroundColor: Colors.primary.mustard + '20' }]}>
                <Volume2 size={24} color={Colors.primary.mustard} />
              </View>
              <View>
                <Text style={styles.optionLabel}>Efectos de sonido</Text>
                <Text style={styles.optionDesc}>Sonidos al completar actividades</Text>
              </View>
            </View>
            <Switch
              value={state.settings.soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: '#EBEBEB', true: Colors.primary.sage }}
              thumbColor="white"
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <View style={[styles.iconBox, { backgroundColor: Colors.primary.sky + '20' }]}>
                <Globe size={24} color={Colors.primary.sky} />
              </View>
              <View>
                <Text style={styles.optionLabel}>Idioma</Text>
                <Text style={styles.optionDesc}>{state.settings.language === 'es' ? 'Español' : 'English'}</Text>
              </View>
            </View>
            <ChevronRight size={24} color={Colors.text.light} />
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionTitle}>MotorMap</Text>
        <Card style={styles.optionCard}>
          <TouchableOpacity style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <View style={[styles.iconBox, { backgroundColor: Colors.primary.lilac + '20' }]}>
                <Info size={24} color={Colors.primary.lilac} />
              </View>
              <Text style={styles.optionLabel}>Acerca de MotorMap</Text>
            </View>
            <ChevronRight size={24} color={Colors.text.light} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <View style={[styles.iconBox, { backgroundColor: Colors.primary.coral + '20' }]}>
                <ShieldCheck size={24} color={Colors.primary.coral} />
              </View>
              <Text style={styles.optionLabel}>Privacidad y Seguridad</Text>
            </View>
            <ChevronRight size={24} color={Colors.text.light} />
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionTitle}>Investigación y Académico</Text>
        <Card style={styles.optionCard}>
          <TouchableOpacity style={styles.optionRow}>
            <View style={styles.optionInfo}>
              <View style={[styles.iconBox, { backgroundColor: Colors.text.dark + '10' }]}>
                <Database size={24} color={Colors.text.dark} />
              </View>
              <View>
                <Text style={styles.optionLabel}>Acceso de Investigación</Text>
                <Text style={styles.optionDesc}>Panel para investigadores universitarios</Text>
              </View>
            </View>
            <ChevronRight size={24} color={Colors.text.light} />
          </TouchableOpacity>
        </Card>

        <TouchableOpacity style={styles.logoutBtn}>
          <LogOut size={20} color={Colors.ui.error} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>MotorMap v1.0.0 (Expo) • Prototipo de Tablet</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.cream,
  },
  header: {
    height: 100,
    backgroundColor: Colors.background.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  backBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.sizes.title2,
    fontWeight: 'bold',
    color: Colors.text.dark,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: 'bold',
    color: Colors.text.medium,
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optionCard: {
    padding: 0, // Options will have their own padding
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLabel: {
    fontSize: Typography.sizes.body,
    fontWeight: '600',
    color: Colors.text.dark,
  },
  optionDesc: {
    fontSize: Typography.sizes.caption,
    color: Colors.text.light,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.ui.border,
    marginHorizontal: Spacing.lg,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 48,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.ui.error + '40',
    borderRadius: 16,
  },
  logoutText: {
    color: Colors.ui.error,
    fontWeight: 'bold',
    fontSize: Typography.sizes.body,
  },
  versionText: {
    textAlign: 'center',
    marginTop: 24,
    color: Colors.text.light,
    fontSize: Typography.sizes.small,
  }
});
