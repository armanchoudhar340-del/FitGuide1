import { Exercise, WorkoutLocation } from './types';

export const EXERCISES: Exercise[] = [
  // --- BACK (5) ---
  { id: 'back_1', name: 'Lat Pulldown', muscles: ['Back'], sets: 3, reps: '10–12', instruction: 'Pull the bar toward your upper chest.', image: '/lat_pulldown_seq.png', category: 'Strength', location: [WorkoutLocation.GYM], difficulty: 'Beginner', equipmentRequired: 'Lat Pulldown' },
  { id: 'back_2', name: 'Seated Cable Row', muscles: ['Back'], sets: 3, reps: '10–12', instruction: 'Pull handle to waist, keep back straight.', image: '/seated_row_seq.png', category: 'Strength', location: [WorkoutLocation.GYM], difficulty: 'Beginner', equipmentRequired: 'Rower' },
  { id: 'back_3', name: 'Barbell Row', muscles: ['Back'], sets: 3, reps: '8–10', instruction: 'Bend forward, pull bar to ribs.', image: '/barbell_row_seq.png', category: 'Strength', location: [WorkoutLocation.GYM], difficulty: 'Intermediate', equipmentRequired: 'Barbells' },
  { id: 'back_4', name: 'Assisted Pull-ups', muscles: ['Back', 'Arms'], sets: 3, reps: '8–10', instruction: 'Use assistance to pull chin over bar.', image: '/assisted_pullups.png', category: 'Strength', location: [WorkoutLocation.GYM, WorkoutLocation.HOME], difficulty: 'Beginner' },
  { id: 'back_5', name: 'Resistance Band Row', muscles: ['Back'], sets: 3, reps: '12–15', instruction: 'Anchor band and row back to squeeze blades.', image: '/resistance_band_row.png', category: 'Strength', location: [WorkoutLocation.GYM, WorkoutLocation.HOME], difficulty: 'Beginner' },

  // --- CHEST (4) ---
  { id: 'chest_1', name: 'Bench Press', muscles: ['Chest'], sets: 3, reps: '8–10', instruction: 'Press bar vertically using a bench.', image: '/bench_press.png', category: 'Strength', location: [WorkoutLocation.GYM], difficulty: 'Beginner', equipmentRequired: 'Barbells' },
  { id: 'chest_2', name: 'Incline Dumbbell Press', muscles: ['Chest', 'Shoulders'], sets: 3, reps: '10', instruction: 'Press dumbbells up at an incline.', image: '/incline_press_seq.png', category: 'Strength', location: [WorkoutLocation.GYM, WorkoutLocation.HOME], difficulty: 'Intermediate', equipmentRequired: 'Dumbbells' },
  { id: 'chest_3', name: 'Chest Fly (Machine)', muscles: ['Chest'], sets: 3, reps: '12', instruction: 'Squeeze handles together in a flying motion.', image: '/chest_fly_seq.png', category: 'Strength', location: [WorkoutLocation.GYM], difficulty: 'Beginner', equipmentRequired: 'Chest Fly' },
  { id: 'chest_4', name: 'Push Ups', muscles: ['Chest', 'Shoulders', 'Triceps'], sets: 3, reps: '15–20', instruction: 'Lower body to floor and push back up.', image: 'https://img.icons8.com/fluency-systems-filled/200/10B981/pushups.png', category: 'Strength', location: [WorkoutLocation.HOME, WorkoutLocation.GYM], difficulty: 'Beginner' },

  // --- SHOULDERS (2) ---
  { id: 'shoulder_1', name: 'Shoulder Press', muscles: ['Shoulders'], sets: 3, reps: '10', instruction: 'Press dumbbells vertically above head.', image: 'https://img.icons8.com/fluency-systems-filled/200/10B981/military-press.png', category: 'Strength', location: [WorkoutLocation.GYM, WorkoutLocation.HOME], difficulty: 'Beginner', equipmentRequired: 'Dumbbells' },
  { id: 'shoulder_2', name: 'Lateral Raise', muscles: ['Shoulders'], sets: 3, reps: '12–15', instruction: 'Raise arms out to the sides horizontally.', image: 'https://img.icons8.com/fluency-systems-filled/200/10B981/deadlift.png', category: 'Strength', location: [WorkoutLocation.GYM, WorkoutLocation.HOME], difficulty: 'Beginner', equipmentRequired: 'Dumbbells' },

  // --- ARMS (4) ---
  { id: 'bicep_1', name: 'Dumbbell Bicep Curl', muscles: ['Biceps'], sets: 3, reps: '12', instruction: 'Curl dumbbells towards shoulders.', image: '/dumbbell_bicep_curl.png', category: 'Strength', location: [WorkoutLocation.GYM, WorkoutLocation.HOME], difficulty: 'Beginner', equipmentRequired: 'Dumbbells' },
  { id: 'bicep_2', name: 'Hammer Curl', muscles: ['Biceps'], sets: 3, reps: '12', instruction: 'Curl dumbbells with neutral grip.', image: '/hammer_curl_seq.png', category: 'Strength', location: [WorkoutLocation.GYM, WorkoutLocation.HOME], difficulty: 'Beginner', equipmentRequired: 'Dumbbells' },
  { id: 'bicep_3', name: 'Concentration Curl', muscles: ['Biceps'], sets: 3, reps: '12', instruction: 'Isolate bicep curling against inner thigh.', image: '/concentration_curl_seq.png', category: 'Strength', location: [WorkoutLocation.GYM, WorkoutLocation.HOME], difficulty: 'Beginner', equipmentRequired: 'Dumbbells' },
  { id: 'bicep_4', name: 'Preacher Curl', muscles: ['Biceps'], sets: 3, reps: '10', instruction: 'Rest arms on pad and curl upwards.', image: '/preacher_curl_seq.png', category: 'Strength', location: [WorkoutLocation.GYM], difficulty: 'Beginner', equipmentRequired: 'Seated Curl' },

  // --- LEGS (4) ---
  { id: 'leg_1', name: 'Bodyweight Squats', muscles: ['Legs'], sets: 3, reps: '15', instruction: 'Lower hips while keeping heels flat.', image: '/squats.png', category: 'Strength', location: [WorkoutLocation.GYM, WorkoutLocation.HOME], difficulty: 'Beginner' },
  { id: 'leg_2', name: 'Leg Press', muscles: ['Legs'], sets: 3, reps: '12', instruction: 'Push weight away using leg power.', image: 'https://img.icons8.com/fluency-systems-filled/200/10B981/leg-press.png', category: 'Strength', location: [WorkoutLocation.GYM], difficulty: 'Beginner', equipmentRequired: 'Leg Press' },
  { id: 'leg_3', name: 'Lunges', muscles: ['Legs'], sets: 3, reps: '12', instruction: 'Step forward and lower back knee to floor.', image: 'https://img.icons8.com/fluency-systems-filled/200/10B981/lunges.png', category: 'Strength', location: [WorkoutLocation.GYM, WorkoutLocation.HOME], difficulty: 'Beginner' },
  { id: 'leg_4', name: 'Calf Raises', muscles: ['Legs'], sets: 3, reps: '20', instruction: 'Raise heels and stand on tiptoes.', image: 'https://img.icons8.com/fluency-systems-filled/200/10B981/flex-foot.png', category: 'Strength', location: [WorkoutLocation.GYM, WorkoutLocation.HOME], difficulty: 'Beginner' },

  // --- CORE (3) ---
  { id: 'core_1', name: 'Plank', muscles: ['Core'], sets: 3, reps: '60s', instruction: 'Hold straight line from head to heels.', image: 'https://img.icons8.com/fluency-systems-filled/200/10B981/plank.png', category: 'Core', location: [WorkoutLocation.HOME, WorkoutLocation.GYM], difficulty: 'Beginner' },
  { id: 'core_2', name: 'Crunches', muscles: ['Core'], sets: 3, reps: '20', instruction: 'Curl upper body towards knees.', image: 'https://img.icons8.com/fluency-systems-filled/200/10B981/crunches.png', category: 'Core', location: [WorkoutLocation.HOME, WorkoutLocation.GYM], difficulty: 'Beginner' },
  { id: 'core_3', name: 'Bicycle Crunches', muscles: ['Core'], sets: 3, reps: '20', instruction: 'Opposite elbow to opposite knee cycling motion.', image: 'https://img.icons8.com/fluency-systems-filled/200/10B981/cycling.png', category: 'Core', location: [WorkoutLocation.HOME, WorkoutLocation.GYM], difficulty: 'Intermediate' },

  // --- CARDIO (2) ---
  { id: 'cardio_1', name: 'Treadmill', muscles: ['Heart', 'Legs'], sets: 1, reps: '15 mins', instruction: 'Running or power walking.', image: 'https://img.icons8.com/fluency-systems-filled/200/10B981/treadmill.png', category: 'Cardio', location: [WorkoutLocation.GYM], difficulty: 'Beginner', equipmentRequired: 'Treadmill' },
  { id: 'cardio_2', name: 'Rowing Machine', muscles: ['Heart', 'Back'], sets: 1, reps: '10 mins', instruction: 'Full-body rowing motion.', image: 'https://img.icons8.com/fluency-systems-filled/200/10B981/rowing-machine.png', category: 'Cardio', location: [WorkoutLocation.GYM], difficulty: 'Intermediate', equipmentRequired: 'Rower' }
];

export const GYM_EQUIPMENT_LIST = [
  { id: 'Treadmill', name: 'Treadmill', icon: '🏃', image: 'https://static.nike.com/a/images/f_auto,cs_srgb/w_1536,c_limit/6a2dbeb8-e877-42c1-ae92-52e1ae29799f/3-treadmill-workouts-that-can-boost-your-fitness.jpg' },
  { id: 'Elliptical', name: 'Elliptical Trainer', icon: '🚲', image: 'https://www.verywellfit.com/thmb/IKFDapYoWte6fznWC8nF_kf2l2Q%3D/1500x0/filters%3Ano_upscale%28%29%3Amax_bytes%28150000%29%3Astrip_icc%28%29/1230802-GettyImages-1391115901-bb3ca635045e489a93bdeacbc016ff1b.jpg' },
  { id: 'Rower', name: 'Rowing Machine', icon: '🚣', image: 'https://res.cloudinary.com/hydrow/image/upload/f_auto/w_3840/q_100/v1717007026/muscles-worked-rowing-the-recovery.png' },
  { id: 'Upright Bike', name: 'Upright Bike', icon: '🚴', image: 'https://hips.hearstapps.com/hmg-prod/images/wahoo-fitness-kickr-bike-v2-678680ddf0090.jpg' },
  { id: 'Recumbent Bike', name: 'Recumbent Bike', icon: '🪑', image: 'https://www.gymsolutions.com.au/wp-content/uploads/2024/11/WhatsApp-Image-2024-11-07-at-17.39.28_98c77776.jpg' },
  { id: 'Spin Bike', name: 'Spin Bike', icon: '🔥', image: 'https://hips.hearstapps.com/hmg-prod/images/wahoo-fitness-kickr-bike-v2-678680ddf0090.jpg' },
  { id: 'Stair Climber', name: 'Stair Climber', icon: '🪜', image: 'https://echelonfit.com/cdn/shop/files/StairClimberSport_MAIN_Image.jpg' },
  { id: 'Air Bike', name: 'Air Bike', icon: '💨', image: 'https://images.ctfassets.net/8urtyqugdt2l/55RwL0ulr5XFA96XpzTHOJ/3b789fae6253c3c4e88d84291200d0ec/desktop-assault-bike-workouts.jpg' },
  { id: 'Ski Erg', name: 'Ski Ergometer', icon: '🎿', image: 'https://repfitness.com/cdn/shop/products/20170718_bharrewyn_concept2ski_sequence-16.jpg' },
  { id: 'Leg Press', name: 'Leg Press', icon: '🦵', image: 'https://hips.hearstapps.com/hmg-prod/images/woman-lifting-weight-on-legs-royalty-free-image-1704915259.jpg' },
  { id: 'Lat Pulldown', name: 'Lat Pulldown', icon: '👐', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=1000' },
  { id: 'Chest Fly', name: 'Chest Fly', icon: '🦋', image: 'https://www.gymsolutions.com.au/wp-content/uploads/2024/11/WhatsApp-Image-2024-11-07-at-17.39.28_98c77776.jpg' },
  { id: 'Seated Curl', name: 'Curl Machine', icon: '💪', image: 'https://gymstogo.com/wp-content/uploads/2020/12/MSEC_01-600x600.jpg' },
  { id: 'Barbells', name: 'Barbells', icon: '🏋️', image: 'https://m.media-amazon.com/images/I/61z1KayVDBL.jpg' },
  { id: 'Dumbbells', name: 'Dumbbells', icon: '⚖️', image: 'https://www.gymsolutions.com.au/wp-content/uploads/2024/11/WhatsApp-Image-2024-11-07-at-17.39.28_98c77776.jpg' },
  { id: 'Cable Machine', name: 'Cable Machine', icon: '⛓️', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000' },
  { id: 'Leg Extension', name: 'Leg Extension', icon: '🦵', image: 'https://images.unsplash.com/photo-1591940746262-b2f4f7fa0a8a?q=80&w=1000' },
  { id: 'Leg Curl', name: 'Leg Curl', icon: '➰', image: 'https://images.unsplash.com/photo-1590487949433-a421d590650a?q=80&w=1000' },
  { id: 'Ab Crunch Machine', name: 'Ab Crunch Machine', icon: '📉', image: 'https://gymstogo.com/wp-content/uploads/2020/12/MSEC_01-600x600.jpg' },
  { id: 'Pull Up Bar', name: 'Pull Up Bar / Power Tower', icon: '🏗️', image: 'https://images.unsplash.com/photo-1598971639058-aba7c12af674?q=80&w=1000' },
  { id: 'Decline Bench', name: 'Decline Bench', icon: '🪑', image: 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?q=80&w=1000' },
  { id: 'Ab Roller', name: 'Ab Roller Wheel', icon: '🛞', image: 'https://cdn.mos.cms.futurecdn.net/v2/t%3A0%2Cl%3A1317%2Ccw%3A3386%2Cch%3A3386%2Cq%3A80%2Cw%3A2560/Hu2Hogef5PxR6gkRXpPDBc.jpg' },
  { id: 'Captain’s Chair', name: 'Captain’s Chair', icon: '💺', image: 'https://www.gymsolutions.com.au/wp-content/uploads/2024/11/WhatsApp-Image-2024-11-07-at-17.39.28_98c77776.jpg' }
];