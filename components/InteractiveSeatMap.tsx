import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pressedSeatId, setPressedSeatId] = useState<string | null>(null);

  // Scroll refs
  const scrollViewHRef = useRef<ScrollView>(null);
  const scrollViewVRef = useRef<ScrollView>(null);

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
    const seat = seats.find((s) => s.id === seatId);
    if (seat) {
      setSelectedSeat(seat);
      setModalVisible(true);
    }
  };

  const handleSeatBook = () => {
    if (selectedSeat) {
      toggleSeat(selectedSeat.id);
      setModalVisible(false);
    }
  };

  // For tap feedback (scale effect)
  const handlePressIn = (seatId: string) => setPressedSeatId(seatId);
  const handlePressOut = () => setPressedSeatId(null);

  // Scroll to top-left
  const scrollToTop = () => {
    scrollViewVRef.current?.scrollTo({ y: 0, animated: true });
    scrollViewHRef.current?.scrollTo({ x: 0, animated: true });
  };

  return (
    <View style={styles.outerContainer}>
      {/* Legend */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendCircle, { backgroundColor: '#00FF00', borderColor: '#000' }]} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendCircle, { backgroundColor: '#FF0000', borderColor: '#000' }]} />
          <Text style={styles.legendText}>Occupied</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendCircle, { backgroundColor: '#00FF00', borderColor: '#0000FF', borderWidth: 2 }]} />
          <Text style={styles.legendText}>Your Seat</Text>
        </View>
      </View>
      {/* SVG Card Container with ScrollViews */}
      <View style={styles.card}>
        <ScrollView
          horizontal
          ref={scrollViewHRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <ScrollView
            ref={scrollViewVRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <Svg width={1200} height={800} viewBox="0 0 3649 4892" style={styles.svg}>
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
                {seats.map((seat) => {
                  const isUserSeat = seat.userId === user?.uid;
                  const isPressed = pressedSeatId === seat.id;
                  return (
                    <Circle
                      key={seat.id}
                      cx={seat.cx}
                      cy={seat.cy}
                      r={isPressed ? seat.r * 1.15 : seat.r}
                      fill={seat.occupied ? '#FF0000' : '#00FF00'}
                      stroke={isUserSeat ? '#0000FF' : '#000000'}
                      strokeWidth={isUserSeat ? 5 : 1}
                      onPress={() => handleSeatPress(seat.id)}
                      onPressIn={() => handlePressIn(seat.id)}
                      onPressOut={handlePressOut}
                    />
                  );
                })}
              </G>
            </Svg>
          </ScrollView>
        </ScrollView>
        {/* Floating Scroll to Top Button */}
        <TouchableOpacity style={styles.scrollTopButton} onPress={scrollToTop}>
          <Text style={styles.scrollTopButtonText}>↑</Text>
        </TouchableOpacity>
      </View>
      {/* Seat Info Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seat Info</Text>
            <Text style={styles.modalSeatId}>Seat: {selectedSeat?.id}</Text>
            <Text>Status: {selectedSeat?.occupied ? (selectedSeat?.userId === user?.uid ? 'Booked by you' : 'Occupied') : 'Available'}</Text>
            <View style={{ flexDirection: 'row', marginTop: 20 }}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: selectedSeat?.occupied && selectedSeat?.userId !== user?.uid ? '#aaa' : '#007bff' }]}
                onPress={handleSeatBook}
                disabled={selectedSeat?.occupied && selectedSeat?.userId !== user?.uid}
              >
                <Text style={styles.modalButtonText}>
                  {selectedSeat?.occupied && selectedSeat?.userId === user?.uid ? 'Unbook' : 'Book'}
                </Text>
              </Pressable>
              <Pressable style={[styles.modalButton, { backgroundColor: '#ccc', marginLeft: 10 }]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.modalButtonText, { color: '#333' }]}>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f3f6fa',
    paddingTop: 10,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  legendCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    marginRight: 6,
  },
  legendText: {
    fontSize: 14,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    position: 'relative',
    maxHeight: 800,
    maxWidth: 1000,
    minHeight: 300,
    minWidth: 200,
  },
  svg: {
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  scrollTopButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#007bff',
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  scrollTopButtonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    minWidth: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSeatId: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#007bff',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 