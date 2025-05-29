import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity
} from 'react-native';
import { auth, db } from '../../firebaseConfig';

type Seat = {
  id: string;
  occupied: boolean;
  userId: string | null;
  x: number;
  y: number;
};

export default function HomeScreen() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const [seats, setSeats] = useState<Seat[]>([]);

  const toggleSeat = async (seatId: string) => {
    if (!user) {
      alert('Please log in to book a seat.');
      return;
    }

    const current = seats.find((s) => s.id === seatId);
    const seatRef = doc(db, 'seats', seatId);
    const userSeat = seats.find((s) => s.userId === user.uid);

    if (userSeat && userSeat.id !== seatId) {
      alert('You can only book one seat at a time.');
      return;
    }
    if (current?.userId && current.userId !== user.uid) {
      alert('This seat is already taken.');
      return;
    }

    const isUnbooking = current?.userId === user.uid;

    await updateDoc(seatRef, {
      occupied: !isUnbooking,
      userId: isUnbooking ? null : user.uid,
    });

    setSeats((prevSeats) =>
      prevSeats.map((seat) =>
        seat.id === seatId
          ? { ...seat, occupied: !isUnbooking, userId: isUnbooking ? null : user.uid }
          : seat
      )
    );
  };

  useEffect(() => {
    const initSeats = async () => {
      const snapshot = await getDocs(collection(db, 'seats'));

      if (snapshot.empty) {
        const defaultSeats: Seat[] = [
          { id: 'S1', occupied: false, userId: null, x: 400, y: 220 },
          { id: 'S2', occupied: false, userId: null, x: 380, y: 220 },
          
        ];

        await Promise.all(
          defaultSeats.map((seat) =>
            setDoc(doc(db, 'seats', seat.id), seat)
          )
        );
        setSeats(defaultSeats);
      } else {
        const seatData: Seat[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Seat, 'id'>),
        }));
        setSeats(seatData);
      }
    };

    initSeats();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Library Seat Map</Text>

      <ScrollView
        horizontal={true}
        contentContainerStyle={{ flexGrow: 1 }}
        style={styles.scrollViewHorizontal}
      >
              <ImageBackground
                source={require('/Users/shaynavinoth/Documents/libraryapp/assets/images/libraerial.png')} // Use relative path
                style={styles.background}
                resizeMode="cover" // or "contain"
              >
              
            {seats.map((seat) => (
              <TouchableOpacity
                key={seat.id}
                onPress={() => toggleSeat(seat.id)}
                style={[
                  styles.seat,
                  {
                    left: seat.x,
                    top: seat.y,
                    backgroundColor: seat.occupied ? 'red' : 'green',
                  },
                ]}
              >
                <Text style={styles.seatText}>{seat.id}</Text>
              </TouchableOpacity>
            ))}
              </ImageBackground>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  background: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  scrollViewHorizontal: {
    flex: 1,
  },
  scrollViewVertical: {
    flex: 1,
  },
  mapArea: {
    width: 380,
    height: 240,
    position: 'relative',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 5,
  },
  seat: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // slight shadow on Android
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  seatText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
