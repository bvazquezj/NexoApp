INSERT INTO routine_templates (name, description, is_system, blocks) VALUES
(
    'Mañana productiva',
    'Rutina matutina enfocada en hábitos saludables y trabajo profundo.',
    true,
    '[
        {"title":"Despertar y meditación","startTime":"06:30","endTime":"07:00","type":"HABIT","habitName":"Meditación","priority":"HIGH","isFlexible":false,"color":"#8B5CF6","notifyStart":true,"notifyEnd":false,"notifyMinutesBefore":10},
        {"title":"Ejercicio","startTime":"07:00","endTime":"07:45","type":"HABIT","habitName":"Ejercicio","priority":"HIGH","isFlexible":false,"color":"#10B981","notifyStart":true,"notifyEnd":true,"notifyMinutesBefore":10},
        {"title":"Desayuno y ducha","startTime":"07:45","endTime":"08:30","type":"BREAK","priority":"MEDIUM","isFlexible":true,"color":"#F59E0B","notifyStart":false,"notifyEnd":false,"notifyMinutesBefore":10},
        {"title":"Trabajo profundo","startTime":"08:30","endTime":"11:30","type":"PRODUCTIVE","priority":"HIGH","isFlexible":false,"color":"#3B82F6","notifyStart":true,"notifyEnd":true,"notifyMinutesBefore":15}
    ]'::jsonb
),
(
    'Día de estudio',
    'Bloques de estudio con descansos pomodoro.',
    true,
    '[
        {"title":"Lectura técnica","startTime":"08:00","endTime":"09:30","type":"PRODUCTIVE","priority":"HIGH","isFlexible":false,"color":"#3B82F6","notifyStart":true,"notifyEnd":true,"notifyMinutesBefore":10},
        {"title":"Descanso","startTime":"09:30","endTime":"09:45","type":"BREAK","isFlexible":true,"color":"#F59E0B","notifyStart":false,"notifyEnd":true,"notifyMinutesBefore":5},
        {"title":"Ejercicios prácticos","startTime":"09:45","endTime":"11:15","type":"PRODUCTIVE","priority":"HIGH","isFlexible":false,"color":"#3B82F6","notifyStart":true,"notifyEnd":true,"notifyMinutesBefore":10},
        {"title":"Repaso y notas","startTime":"11:30","endTime":"12:30","type":"PRODUCTIVE","priority":"MEDIUM","isFlexible":true,"color":"#3B82F6","notifyStart":true,"notifyEnd":false,"notifyMinutesBefore":10}
    ]'::jsonb
),
(
    'Día de descanso',
    'Día relajado con tiempo libre y autocuidado.',
    true,
    '[
        {"title":"Despertar tranquilo","startTime":"08:30","endTime":"09:30","type":"FREE","isFlexible":true,"color":"#EC4899","notifyStart":false,"notifyEnd":false,"notifyMinutesBefore":10},
        {"title":"Lectura","startTime":"09:30","endTime":"10:30","type":"HABIT","habitName":"Lectura","priority":"LOW","isFlexible":true,"color":"#F59E0B","notifyStart":true,"notifyEnd":false,"notifyMinutesBefore":10},
        {"title":"Tiempo libre","startTime":"10:30","endTime":"13:00","type":"FREE","isFlexible":true,"color":"#EC4899","notifyStart":false,"notifyEnd":false,"notifyMinutesBefore":10},
        {"title":"Caminata","startTime":"17:00","endTime":"18:00","type":"HABIT","habitName":"Caminata","priority":"MEDIUM","isFlexible":true,"color":"#10B981","notifyStart":true,"notifyEnd":false,"notifyMinutesBefore":10}
    ]'::jsonb
),
(
    'Recuperación de fin de semana',
    'Equilibrio entre descanso y hábitos clave para recuperar energía.',
    true,
    '[
        {"title":"Sueño reparador","startTime":"00:00","endTime":"09:00","type":"SLEEP","isFlexible":false,"color":"#6B7280","notifyStart":false,"notifyEnd":true,"notifyMinutesBefore":15},
        {"title":"Estiramiento","startTime":"09:15","endTime":"09:45","type":"HABIT","habitName":"Estiramiento","priority":"MEDIUM","isFlexible":true,"color":"#10B981","notifyStart":true,"notifyEnd":false,"notifyMinutesBefore":5},
        {"title":"Desayuno saludable","startTime":"09:45","endTime":"10:30","type":"BREAK","isFlexible":true,"color":"#F59E0B","notifyStart":false,"notifyEnd":false,"notifyMinutesBefore":10},
        {"title":"Tiempo de hobby","startTime":"10:30","endTime":"12:30","type":"FREE","isFlexible":true,"color":"#EC4899","notifyStart":false,"notifyEnd":false,"notifyMinutesBefore":10},
        {"title":"Planificación de la semana","startTime":"18:00","endTime":"19:00","type":"PRODUCTIVE","priority":"MEDIUM","isFlexible":true,"color":"#3B82F6","notifyStart":true,"notifyEnd":true,"notifyMinutesBefore":10}
    ]'::jsonb
);
