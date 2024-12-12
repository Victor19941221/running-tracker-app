import React, { useState } from 'react';
import { View, TextInput, Button, Text, ScrollView, Alert } from 'react-native';
import { initDatabase, createTrainingSession, addExerciseToSession } from './database'; // Se till att importera rätt fil för din databaslogik

// Initiera databasen när appen startar
initDatabase();

const AddTrainingSession = () => {
  const [sessionId, setSessionId] = useState(null);
  const [exerciseName, setExerciseName] = useState('');
  const [repetitions, setRepetitions] = useState('');
  const [sets, setSets] = useState('');
  const [weight, setWeight] = useState('');
  const [exercises, setExercises] = useState([]);

  // Funktion för att lägga till en ny träningssession
  const handleCreateTrainingSession = async () => {
    try {
      const id = await createTrainingSession();
      setSessionId(id);
      Alert.alert('Träningspass skapat!', `Session ID: ${id}`);
    } catch (error) {
      Alert.alert('Error', 'Kunde inte skapa träningssession');
    }
  };

  // Funktion för att lägga till en ny övning till den aktuella träningssessionen
  const handleAddExercise = async () => {
    if (!sessionId) {
      Alert.alert('Error', 'Skapa ett träningspass först');
      return;
    }

    if (!exerciseName || !repetitions || !sets) {
      Alert.alert('Error', 'Alla fält måste fyllas i');
      return;
    }

    try {
      const newExercise = {
        sessionId,
        name: exerciseName,
        repetitions: parseInt(repetitions),
        sets: parseInt(sets),
        weight: parseFloat(weight),
      };

      await addExerciseToSession(sessionId, exerciseName, newExercise.repetitions, newExercise.sets, newExercise.weight || 0);
      
      setExercises([...exercises, newExercise]);

      // Töm formuläret efter att övningen har lagts till
      setExerciseName('');
      setRepetitions('');
      setSets('');
      setWeight('');

      Alert.alert('Övning tillagd', `Övning "${exerciseName}" tillagd!`);
    } catch (error) {
      Alert.alert('Error', 'Kunde inte lägga till övning');
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>Lägg till ett träningspass</Text>
      
      <Button title="Skapa Träningspass" onPress={handleCreateTrainingSession} />

      {sessionId && (
        <>
          <Text style={{ marginTop: 20, fontSize: 18 }}>Lägg till övningar</Text>
          <TextInput
            placeholder="Övningens namn"
            value={exerciseName}
            onChangeText={setExerciseName}
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />
          <TextInput
            placeholder="Repetitioner"
            value={repetitions}
            onChangeText={setRepetitions}
            keyboardType="numeric"
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />
          <TextInput
            placeholder="Set"
            value={sets}
            onChangeText={setSets}
            keyboardType="numeric"
            style={{ borderBottomWidth: 1, marginBottom: 10 }}
          />
          <TextInput
            placeholder="Vikt (optional)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            style={{ borderBottomWidth: 1, marginBottom: 20 }}
          />
          <Button title="Lägg till övning" onPress={handleAddExercise} />
          
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18 }}>Inlagda övningar:</Text>
            {exercises.length > 0 ? (
              exercises.map((exercise, index) => (
                <Text key={index} style={{ marginTop: 5 }}>
                  {exercise.name} - {exercise.repetitions} reps x {exercise.sets} set {exercise.weight ? `med ${exercise.weight}kg` : ''}
                </Text>
              ))
            ) : (
              <Text>Inga övningar inlagda ännu.</Text>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default AddTrainingSession;
