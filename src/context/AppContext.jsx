import React, { createContext, useContext, useReducer, useMemo } from 'react';
import {
  STUDENTS_INITIAL,
  COURSES_INITIAL,
  TEACHER,
  enrichStudentData,
  getCoursesForTeacher,
} from '../data/dataset.js';
import {
  calcPromedio,
  notaVisual,
  calcRiesgo,
  calcNotaNecesaria,
  getEvalConfig,
} from '../services/metrics.service.js';

const AppContext = createContext(null);

const initialState = {
  authState: 'login',
  currentUser: null,
  loginAttempts: 0,
  accountLocked: false,
  recoveryCode: null,
  recoveryEmail: null,
  students: [],
  courses: [],
  teacher: {
    codigo: '',
    nombre: 'Cargando...',
    email: '',
    cargo: '',
    departamento: '',
    avatar: null,
  },
  adminTab: 'students',
  isNotificationsOpen: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS': {
      const { profile } = action.payload;
      return {
        ...state,
        authState: 'authenticated',
        currentUser: profile,
        teacher: profile,
        courses: getCoursesForTeacher(profile.codigo),
      };
    }

    case 'SET_STUDENTS':
      return {
        ...state,
        students: action.payload,
      };

    case 'LOGOUT':
      return {
        ...initialState,
        students: [],
        courses: [],
      };

    case 'SET_ADMIN_TAB':
      return { ...state, adminTab: action.payload };

    case 'TOGGLE_NOTIFICATIONS':
      return { ...state, isNotificationsOpen: !state.isNotificationsOpen };

    case 'ADD_STUDENT': {
      const s = action.payload;
      const evals = getEvalConfig(s.cursoId || state.courses[0]?.id);
      const grades = {};
      evals.forEach((e) => {
        grades[e.key] = +(s[e.key] || 0);
      });
      const promedio = calcPromedio(grades, evals);
      const riesgo = calcRiesgo(promedio, s.asistencia || 0, s.actividadDias || 0);
      const necesita = calcNotaNecesaria(grades, evals);
      const ultimaEval = evals[evals.length - 1];
      const newStudent = {
        ...s,
        grades,
        promedio,
        notaFinal: notaVisual(promedio),
        riesgo,
        notaNecesaria: necesita,
        notaNecesariaLabel: ultimaEval.label,
        notaNecesariaKey: ultimaEval.key,
        notaNecesariaWeight: ultimaEval.weight,
        actividadMensual: [
          { mes: 'Feb', accesos: 20 },
          { mes: 'Mar', accesos: 18 },
          { mes: 'Abr', accesos: 15 },
          { mes: 'May', accesos: 10 },
        ],
        email: `${s.codigo.toLowerCase()}@utp.edu.pe`,
        intervenido: false,
      };
      return { ...state, students: [...state.students, enrichStudentData(newStudent)] };
    }

    case 'UPDATE_STUDENT': {
      const updated = state.students.map((st) => {
        if (st.codigo !== action.payload.codigo) return st;
        const grades = { ...st.grades, ...action.payload.changes };
        const evals = getEvalConfig(st.cursoId || state.courses[0]?.id);
        const promedio = calcPromedio(grades, evals);
        const riesgo = calcRiesgo(promedio, st.asistencia, st.actividadDias);
        const necesita = calcNotaNecesaria(grades, evals);
        const ultimaEval = evals[evals.length - 1];
        const updatedStudent = {
          ...st,
          ...action.payload.changes,
          grades,
          promedio,
          notaFinal: notaVisual(promedio),
          riesgo,
          notaNecesaria: necesita,
          notaNecesariaLabel: ultimaEval.label,
          notaNecesariaKey: ultimaEval.key,
          notaNecesariaWeight: ultimaEval.weight,
        };
        return enrichStudentData(updatedStudent, true);
      });
      return { ...state, students: updated };
    }

    case 'DELETE_STUDENT':
      return { ...state, students: state.students.filter((s) => s.codigo !== action.payload) };

    case 'MARK_INTERVENED':
      return {
        ...state,
        students: state.students.map((s) =>
          s.codigo === action.payload ? { ...s, intervenido: true } : s
        ),
      };

    case 'ADD_COURSE':
      return { ...state, courses: [...state.courses, action.payload] };

    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map((c) =>
          c.id === action.payload.id ? { ...c, ...action.payload.changes } : c
        ),
      };

    case 'DELETE_COURSE':
      return { ...state, courses: state.courses.filter((c) => c.id !== action.payload) };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // dispatch es estable entre renders, por lo que actions solo se crea una vez
  const actions = useMemo(
    () => ({
      loginSuccess: (user, profile) =>
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, profile } }),
      setStudents: (students) => dispatch({ type: 'SET_STUDENTS', payload: students }),
      logout: () => dispatch({ type: 'LOGOUT' }),
      setAdminTab: (tab) => dispatch({ type: 'SET_ADMIN_TAB', payload: tab }),
      toggleNotifications: () => dispatch({ type: 'TOGGLE_NOTIFICATIONS' }),
      addStudent: (student) => dispatch({ type: 'ADD_STUDENT', payload: student }),
      updateStudent: (codigo, changes) =>
        dispatch({ type: 'UPDATE_STUDENT', payload: { codigo, changes } }),
      deleteStudent: (codigo) => dispatch({ type: 'DELETE_STUDENT', payload: codigo }),
      markIntervened: (codigo) => dispatch({ type: 'MARK_INTERVENED', payload: codigo }),
      addCourse: (course) => dispatch({ type: 'ADD_COURSE', payload: course }),
      updateCourse: (id, changes) => dispatch({ type: 'UPDATE_COURSE', payload: { id, changes } }),
      deleteCourse: (id) => dispatch({ type: 'DELETE_COURSE', payload: id }),
    }),
    []
  );

  const value = useMemo(() => ({ state, actions }), [state, actions]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
