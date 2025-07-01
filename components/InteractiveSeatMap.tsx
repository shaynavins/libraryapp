import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import seatData from '../assets/seat-data.json';
import { auth, db } from '../firebaseConfig';

const window = Dimensions.get('window');
const BG_COLOR = '#f8f5ee'; // very light beige
const CARD_COLOR = '#fff'; // white
const SVG_BG_COLOR = '#fff'; // white
const BORDER_COLOR = '#e5e5e5'; // light grey
const TEXT_COLOR = '#18181b'; // black
const SEAT_AVAILABLE = '#bbf7d0'; // soft green
const SEAT_BOOKED = '#fecaca'; // soft red
const SEAT_YOUR = '#ddd6fe'; // soft purple

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
      console.log('Firebase user:', currentUser);
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
      Alert.alert('You already have a seat booked. Please unbook your current seat before booking another.');
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
    <View style={styles.gradientBg}>
      <View style={styles.outerContainer}>
        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendPill]}> 
              <View style={[styles.legendCircle, { backgroundColor: SEAT_AVAILABLE, borderColor: '#18181b' }]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendPill]}> 
              <View style={[styles.legendCircle, { backgroundColor: SEAT_BOOKED, borderColor: '#18181b' }]} />
              <Text style={styles.legendText}>Booked</Text>
            </View>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendPill]}> 
              <View style={[styles.legendCircle, { backgroundColor: SEAT_YOUR, borderColor: '#18181b', borderWidth: 2 }]} />
              <Text style={styles.legendText}>Your Seat</Text>
            </View>
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
              <View style={styles.svgContainer}>
                <Svg width={1200} height={800} viewBox="0 0 3649 4892" style={styles.svg}>
                  <Defs>
                    <ClipPath id="clip0_3319_3">
                      <Rect width="3649" height="4892" fill="white"/>
                    </ClipPath>
                  </Defs>
                  <G clipPath="url(#clip0_3319_3)">
                    {/* Background library layout */}
                    <Rect width="3649" height="4892" fill="#fff" stroke="#222" strokeWidth="6"/>
                    <Path d="M2394 4877H3635V3841H3131.45L2394 4600.95V4877Z" fill="#fff" stroke="#222" strokeWidth="10"/>
                    <Path d="M1354.5 4891.5V4609L564 3839H25V4891.5H1354.5Z" fill="#fff" stroke="#222" strokeWidth="10"/>
                    <Path d="M548 3836.49V2781.89L802.452 2518.78V1959H2862.97V2518.78L3125 2799.21V3849.48L2389.8 4606.32V4890H1344.92V4606.32L548 3836.49Z" fill="#fff" stroke="#222" strokeWidth="10"/>
                    <Path d="M533.5 2797L799 2524.5V2302.5H8.5V2797H533.5Z" fill="#fff" stroke="#222" strokeWidth="10"/>
                    <Path d="M3649 2297V1957H2861V2297H3649Z" fill="#fff" stroke="#222" strokeWidth="10"/>
                    <Path d="M795 2297V1957H7V2297H795Z" fill="#fff" stroke="#222" strokeWidth="10"/>
                    <Path d="M3645 1949V568.504H3162.43V16.3051L477.207 0V542.416H0V1949H3645Z" fill="#fff" stroke="#222" strokeWidth="10"/>
                    <Path d="M2856.89 2304.44L3642.45 2307.54L3640.55 2787.1L3125.74 2785.07L2856.03 2522.29L2856.89 2304.44Z" fill="#fff" stroke="#222" strokeWidth="10"/>
                    <Path d="M1188 3558.31L1561.39 3960H2112.28L2490 3558.31V3022.36L2112.28 2625H1561.39L1188 3022.36V3558.31Z" fill="#fff" stroke="#222" strokeWidth="10"/>
                    {/* Interactive seats */}
                    {seats.map((seat) => {
                      const isUserSeat = seat.userId === user?.uid;
                      const isPressed = pressedSeatId === seat.id;
                      let fillColor = SEAT_AVAILABLE;
                      let strokeColor = '#18181b';
                      let strokeWidth = 1.5;
                      if (seat.occupied && !isUserSeat) {
                        fillColor = SEAT_BOOKED;
                        strokeColor = '#18181b';
                        strokeWidth = 1.5;
                      }
                      if (isUserSeat) {
                        fillColor = SEAT_YOUR;
                        strokeColor = '#18181b';
                        strokeWidth = 2.5;
                      }
                      return (
                        <Circle
                          key={seat.id}
                          cx={seat.cx}
                          cy={seat.cy}
                          r={isPressed ? seat.r * 1.15 : seat.r}
                          fill={fillColor}
                          stroke={strokeColor}
                          strokeWidth={strokeWidth}
                          opacity={1}
                          onPress={() => handleSeatPress(seat.id)}
                          onPressIn={() => handlePressIn(seat.id)}
                          onPressOut={handlePressOut}
                        />
                      );
                    })}
                  </G>
                </Svg>
              </View>
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
              <Text style={styles.modalStatus}>
                Status: {selectedSeat?.occupied ? (selectedSeat?.userId === user?.uid ? 'Booked by you' : 'Occupied') : 'Available'}
              </Text>
              <View style={{ flexDirection: 'row', marginTop: 24 }}>
                <Pressable
                  style={[styles.modalButton, { backgroundColor: SVG_BG_COLOR, borderColor: BORDER_COLOR, borderWidth: 1 }]}
                  onPress={handleSeatBook}
                  disabled={selectedSeat?.occupied}
                >
                  <Text style={[styles.modalButtonText, { color: TEXT_COLOR }]}> 
                    {selectedSeat?.occupied && selectedSeat?.userId === user?.uid ? 'Unbook' : 'Book'}
                  </Text>
                </Pressable>
                <Pressable style={[styles.modalButton, { backgroundColor: SVG_BG_COLOR, borderColor: BORDER_COLOR, borderWidth: 1, marginLeft: 14 }]} onPress={() => setModalVisible(false)}>
                  <Text style={[styles.modalButtonText, { color: TEXT_COLOR }]}>Close</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gradientBg: {
    flex: 1,
    backgroundColor: BG_COLOR,
  },
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: window.height,
    paddingTop: 10,
    backgroundColor: BG_COLOR,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 18,
  },
  legendItem: {
    marginRight: 0,
  },
  legendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 0,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    backgroundColor: CARD_COLOR,
  },
  legendCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 16,
    color: TEXT_COLOR,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: CARD_COLOR,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    position: 'relative',
    maxHeight: 900,
    maxWidth: 1400,
    minHeight: 300,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'transparent',
    elevation: 0,
  },
  svgContainer: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    backgroundColor: SVG_BG_COLOR,
    shadowColor: 'transparent',
    elevation: 0,
  },
  svg: {
    borderRadius: 18,
    backgroundColor: SVG_BG_COLOR,
  },
  scrollTopButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: CARD_COLOR,
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    shadowColor: 'transparent',
    elevation: 0,
  },
  scrollTopButtonText: {
    color: TEXT_COLOR,
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(248,245,238,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: CARD_COLOR,
    borderRadius: 18,
    padding: 32,
    alignItems: 'center',
    minWidth: 280,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
    shadowColor: 'transparent',
    elevation: 0,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: TEXT_COLOR,
    letterSpacing: 0.5,
  },
  modalSeatId: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    color: TEXT_COLOR,
  },
  modalStatus: {
    fontSize: 16,
    color: TEXT_COLOR,
    marginBottom: 2,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    backgroundColor: SVG_BG_COLOR,
    borderWidth: 1.5,
    borderColor: BORDER_COLOR,
  },
  modalButtonText: {
    color: TEXT_COLOR,
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.2,
  },
}); 