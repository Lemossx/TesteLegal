import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Image, TouchableOpacity, Animated, ScrollView, Switch, TextInput } from 'react-native';
import { Audio } from 'expo-av';
import DateTimePicker from '@react-native-community/datetimepicker';
// Remove SafeAreaView import
// import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const [sound, setSound] = useState();
  const [selectedTime, setSelectedTime] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [alarms, setAlarms] = useState([]);
  const [alarmRinging, setAlarmRinging] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [languageVisible, setLanguageVisible] = useState(false);
  const [language, setLanguage] = useState('pt');
  const [introVisible, setIntroVisible] = useState(true);
  const [editIndex, setEditIndex] = useState(null);
  const [label, setLabel] = useState('');
  const [labelVisible, setLabelVisible] = useState(false);
  const [currentLabel, setCurrentLabel] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];
  const progressAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        setIntroVisible(false);
      }, 2000);
    });

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, [fadeAnim, progressAnim]);

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('./assets/alarm.mp3')
      );
      setSound(sound);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.replayAsync(); // Repetir o som até que o usuário pare
        }
      });
    } catch (error) {
      console.error('Erro ao tocar o som', error);
    }
  };

  const stopAlarm = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
    setAlarmRinging(false);
    setCurrentLabel('');
  };

  const setAlarm = (event, date) => {
    if (event.type === 'set') {
      if (editIndex !== null) {
        const updatedAlarms = [...alarms];
        updatedAlarms[editIndex].time = date;
        updatedAlarms[editIndex].label = label;
        setAlarms(updatedAlarms);
        setEditIndex(null);
      } else {
        const newAlarm = {
          time: date,
          active: true,
          label: label,
        };
        setAlarms([...alarms, newAlarm]);
      }
      setShowPicker(false);
      setLabel('');
    } else if (event.type === 'dismissed') {
      setShowPicker(false);
    }
  };

  useEffect(() => {
    const checkAlarm = setInterval(() => {
      const currentTime = new Date();
      alarms.forEach((alarm, index) => {
        if (
          alarm.active &&
          currentTime.getHours() === alarm.time.getHours() &&
          currentTime.getMinutes() === alarm.time.getMinutes()
        ) {
          playSound();
          const updatedAlarms = [...alarms];
          updatedAlarms[index].active = false;
          setAlarms(updatedAlarms);
          setAlarmRinging(true);
          setCurrentLabel(alarm.label);
        }
      });
    }, 1000);

    return () => clearInterval(checkAlarm);
  }, [alarms]);

  const openTimePicker = () => {
    setShowPicker(true);
  };

  const openSettings = () => {
    setSettingsVisible(true);
  };

  const closeSettings = () => {
    setSettingsVisible(false);
  };

  const openLanguageSettings = () => {
    setLanguageVisible(true);
  };

  const closeLanguageSettings = () => {
    setLanguageVisible(false);
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
    closeLanguageSettings();
  };

  const toggleAlarm = (index) => {
    const updatedAlarms = [...alarms];
    updatedAlarms[index].active = !updatedAlarms[index].active;
    setAlarms(updatedAlarms);
  };

  const deleteAlarm = (index) => {
    const updatedAlarms = alarms.filter((_, i) => i !== index);
    setAlarms(updatedAlarms);
  };

  const editAlarm = (index) => {
    setSelectedTime(alarms[index].time);
    setLabel(alarms[index].label);
    setEditIndex(index);
    setShowPicker(true);
  };

  const openLabelModal = (index) => {
    setLabel(alarms[index].label);
    setEditIndex(index);
    setLabelVisible(true);
  };

  const saveLabel = () => {
    const updatedAlarms = [...alarms];
    updatedAlarms[editIndex].label = label;
    setAlarms(updatedAlarms);
    setLabel('');
    setEditIndex(null);
    setLabelVisible(false);
  };

  const translations = {
    pt: {
      myAlarm: 'Meu Alarme',
      alarmSetFor: 'Alarme configurado para:',
      noAlarmSet: 'Nenhum alarme configurado',
      chooseTime: 'Escolher hora',
      alarmRinging: 'Alarme tocando!',
      stopAlarm: 'Parar Alarme',
      settings: 'Configurações',
      language: 'Idioma',
      option2: 'Opção 2',
      close: 'Fechar',
      loading: 'Carregando...',
    },
    en: {
      myAlarm: 'My Alarm',
      alarmSetFor: 'Alarm set for:',
      noAlarmSet: 'No alarm set',
      chooseTime: 'Choose time',
      alarmRinging: 'Alarm ringing!',
      stopAlarm: 'Stop Alarm',
      settings: 'Settings',
      language: 'Language',
      option2: 'Option 2',
      close: 'Close',
      loading: 'Loading...',
    },
  };

  const t = translations[language];

  return (
    // Replace SafeAreaView with View
    <View style={styles.container}>
      {introVisible && (
        <Animated.View style={[styles.introContainer, { opacity: fadeAnim }]}>
          <Text style={styles.introText}>DoseLI</Text>
          <View style={styles.progressBarContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
          <Text style={styles.loadingText}>{t.loading}</Text>
        </Animated.View>
      )}
      {!introVisible && (
        <>
          <View style={styles.headerContainer}>
            <View style={styles.logoContainer}>
              <Image source={require('./assets/logo.png')} style={styles.logo} />
            </View>
            <Text style={styles.appName}>DoseLI</Text>
            <TouchableOpacity style={styles.settingsButton} onPress={openSettings}>
              <Image source={require('./assets/engrenagem.png')} style={styles.settingsIcon} />
            </TouchableOpacity>
          </View>
          <Text style={styles.header}>{t.myAlarm}</Text>
          <ScrollView style={styles.alarmList}>
            {alarms.length > 0 ? (
              alarms.map((alarm, index) => (
                <View key={index} style={styles.alarmItem}>
                  <View>
                    <Text style={styles.alarmText}>{alarm.time.toLocaleTimeString()}</Text>
                    <Text style={styles.alarmLabel}>{alarm.label}</Text>
                  </View>
                  <Switch
                    value={alarm.active}
                    onValueChange={() => toggleAlarm(index)}
                    trackColor={{ false: '#767577', true: '#20c997' }} // Cor da trilha
                    thumbColor={alarm.active ? '#1eba8c' : '#f4f3f4'} // Cor do polegar
                  />
                  <TouchableOpacity onPress={() => openLabelModal(index)}>
                    <Image source={require('./assets/etiqueta.png')} style={styles.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => editAlarm(index)}>
                    <Image source={require('./assets/editar.png')} style={styles.icon} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteAlarm(index)}>
                    <Image source={require('./assets/lixeira.png')} style={styles.icon} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.text}>{t.noAlarmSet}</Text>
            )}
          </ScrollView>
          <TouchableOpacity style={styles.button} onPress={openTimePicker}>
            <Text style={styles.buttonText}>{t.chooseTime}</Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={selectedTime || new Date()}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={setAlarm}
              textColor="#20c997" // Cor verde água
            />
          )}
          <Modal
            animationType="slide"
            transparent={true}
            visible={alarmRinging}
            onRequestClose={() => {
              setAlarmRinging(false);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>{t.alarmRinging}</Text>
                {currentLabel ? <Text style={styles.modalLabel}>{currentLabel}</Text> : null}
                <TouchableOpacity style={styles.stopButton} onPress={stopAlarm}>
                  <Text style={styles.stopButtonText}>{t.stopAlarm}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={settingsVisible}
            onRequestClose={closeSettings}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>{t.settings}</Text>
                <TouchableOpacity style={styles.settingsOption} onPress={openLanguageSettings}>
                  <Text style={styles.settingsOptionText}>{t.language}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingsOption} onPress={closeSettings}>
                  <Text style={styles.settingsOptionText}>{t.option2}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingsOption} onPress={closeSettings}>
                  <Text style={styles.settingsOptionText}>{t.close}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={languageVisible}
            onRequestClose={closeLanguageSettings}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>{t.language}</Text>
                <TouchableOpacity style={styles.settingsOption} onPress={() => changeLanguage('en')}>
                  <View style={styles.languageOption}>
                    <Image source={require('./assets/eua.png')} style={styles.flagIcon} />
                    <Text style={styles.settingsOptionText}>English</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingsOption} onPress={() => changeLanguage('pt')}>
                  <View style={styles.languageOption}>
                    <Image source={require('./assets/br.png')} style={styles.flagIcon} />
                    <Text style={styles.settingsOptionText}>Português</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.settingsOption} onPress={closeLanguageSettings}>
                  <Text style={styles.settingsOptionText}>{t.close}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={labelVisible}
            onRequestClose={() => {
              setLabelVisible(false);
            }}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalText}>Adicionar Etiqueta</Text>
                <TextInput
                  style={styles.labelInput}
                  placeholder="Adicionar etiqueta"
                  value={label}
                  onChangeText={setLabel}
                />
                <TouchableOpacity style={styles.saveButton} onPress={saveLabel}>
                  <Text style={styles.saveButtonText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Remove safeArea style
  // safeArea: {
  //   flex: 1,
  //   backgroundColor: '#20c997', // Cor verde água
  // },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 40, // Abaixar um pouco mais
    left: 20,
    right: 20,
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  appName: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#333',
    position: 'absolute',
    left: '40%',
  },
  settingsButton: {
    padding: 10,
  },
  settingsIcon: {
    width: 30,
    height: 30,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
    marginTop: 80, // Adicionar margem superior para ajustar a posição
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  button: { // botão "escolher hora"
    backgroundColor: '#20c997', // Cor verde água
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    width: '75%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  stopButton: {
    backgroundColor: '#20c997', // Cor verde água
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  stopButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingsOption: {
    backgroundColor: '#20c997', // Cor verde água
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '80%',
  },
  settingsOptionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  flagIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  introContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#20c997', // Cor verde água
  },
  introTextContainer: {
    flexDirection: 'row',
  },
  introText: {
    fontSize: 45, //diminuí para 45
    fontWeight: 'bold',
    color: '#fff', // Cor branca
  },
  progressBarContainer: {
    width: '80%',
    height: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 20,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#12a378',
  },
  loadingText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 10,
  },
  introLogo: {
    width: 125,
    height: 125,
    marginBottom: 20,
  },
  alarmList: {
    width: '100%',
    marginTop: 20,
  },
  alarmItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff', //cor branca
    borderRadius: 10,
    marginBottom: 10,
  },
  alarmText: {
    fontSize: 18,
    color: '#333',
  },
  alarmLabel: {
    fontSize: 14,
    color: '#666',
  },
  icon: {
    width: 24,
    height: 24,
  },
  labelInput: {
    borderColor: '#20c997',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: '#333',
    width: '100%',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#20c997',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold', //certo
  },
});