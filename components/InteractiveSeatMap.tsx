import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import seatData from '../assets/seat-data.json';
import { auth, db } from '../firebaseConfig';

type Seat = {
  id: string;
  occupied: boolean;
  userId: string | null;
  cx: number;
  cy: number;
  r: number;
};

export default function InteractiveSeatMap() {
  const [user, setUser] = useState<User | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const toggleSeat = async (seatId: string) => {
    if (!user) {
      Alert.alert('Please log in to book a seat.');
      return;
    }

    const current = seats.find((s) => s.id === seatId);
    const seatRef = doc(db, 'seats', seatId);
    const userSeat = seats.find((s) => s.userId === user.uid);

    if (userSeat && userSeat.id !== seatId) {
      Alert.alert('You can only book one seat at a time.');
      return;
    }
    if (current?.userId && current.userId !== user.uid) {
      Alert.alert('This seat is already taken.');
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
        // Use all seats from the extracted data
        const defaultSeats: Seat[] = seatData;

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

  const handleSeatPress = (seatId: string) => {
    toggleSeat(seatId);
  };

  return (
    <View style={styles.container}>
      <Svg width="3649" height="4892" viewBox="0 0 3649 4892" style={styles.svg}>
        <Defs>
          <ClipPath id="clip0_3319_3">
            <Rect width="3649" height="4892" fill="white"/>
          </ClipPath>
        </Defs>
        
        <G clipPath="url(#clip0_3319_3)">
          {/* Background library layout */}
          <Rect width="3649" height="4892" fill="white"/>
          <Path d="M2394 4877H3635V3841H3131.45L2394 4600.95V4877Z" fill="#D9D9D9" stroke="black" strokeWidth="10"/>
          <Path d="M1354.5 4891.5V4609L564 3839H25V4891.5H1354.5Z" fill="#D9D9D9" stroke="black" strokeWidth="10"/>
          <Path d="M548 3836.49V2781.89L802.452 2518.78V1959H2862.97V2518.78L3125 2799.21V3849.48L2389.8 4606.32V4890H1344.92V4606.32L548 3836.49Z" fill="#D9D9D9" stroke="black" strokeWidth="10"/>
          <Path d="M533.5 2797L799 2524.5V2302.5H8.5V2797H533.5Z" fill="#D9D9D9" stroke="black" strokeWidth="10"/>
          <Path d="M3649 2297V1957H2861V2297H3649Z" fill="#8D8D8F" stroke="black" strokeWidth="10"/>
          <Path d="M795 2297V1957H7V2297H795Z" fill="#8D8D8F" stroke="black" strokeWidth="10"/>
          <Path d="M3645 1949V568.504H3162.43V16.3051L477.207 0V542.416H0V1949H3645Z" fill="#D9D9D9" stroke="black" strokeWidth="10"/>
          <Path d="M2856.89 2304.44L3642.45 2307.54L3640.55 2787.1L3125.74 2785.07L2856.03 2522.29L2856.89 2304.44Z" fill="#D9D9D9" stroke="black" strokeWidth="10"/>
          <Path d="M1188 3558.31L1561.39 3960H2112.28L2490 3558.31V3022.36L2112.28 2625H1561.39L1188 3022.36V3558.31Z" fill="#D9D9D9" stroke="black" strokeWidth="10"/>
          
          {/* Interactive seats */}
          {seats.map((seat) => (
            <Circle
              key={seat.id}
              cx={seat.cx}
              cy={seat.cy}
              r={seat.r}
              fill={seat.occupied ? '#FF0000' : '#00FF00'}
              stroke={seat.userId === user?.uid ? '#0000FF' : '#000000'}
              strokeWidth={seat.userId === user?.uid ? 3 : 1}
              onPress={() => handleSeatPress(seat.id)}
            />
          ))}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
}); 