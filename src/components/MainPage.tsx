import { 
  Box, 
  Tab, 
  Tabs, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton,
  Paper,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider
} from '@mui/material';
import { supabase } from '../lib/supabase';
import type { MeterReading } from '../types/meterReading';
import { useState, useEffect } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const MainPage = () => {
  const [value, setValue] = useState(0);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [formData, setFormData] = useState<MeterReading>({
    water_total: null,
    water_business_before: null,
    water_business_after: null,
    electricity_total: null,
    electricity_business_before: null,
    electricity_business_after: null,
    l1_small_left: null,
    l1_small_right: null,
    l1_large: null,
    l2_small_left: null,
    l2_small_right: null,
    l2_large: null,
  });
  const [recordId, setRecordId] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  // const [loading, setLoading] = useState(false); // removed unused variable
// For Công thức tab
  const [formulaMonth, setFormulaMonth] = useState(currentMonth);
  const [formulaYear, setFormulaYear] = useState(currentYear);
  const [currentElectric, setCurrentElectric] = useState<number|null>(null);
  const [prevElectric, setPrevElectric] = useState<number|null>(null);
  const [electricDiff, setElectricDiff] = useState<number|null>(null);
  // L1, L2, KD
  const [currentL1, setCurrentL1] = useState<number|null>(null);
  const [prevL1, setPrevL1] = useState<number|null>(null);
  const [diffL1, setDiffL1] = useState<number|null>(null);
  const [currentL2, setCurrentL2] = useState<number|null>(null);
  const [prevL2, setPrevL2] = useState<number|null>(null);
  const [diffL2, setDiffL2] = useState<number|null>(null);
  // L1 trái bé
  const [currentL1LeftSmall, setCurrentL1LeftSmall] = useState<number|null>(null);
  const [prevL1LeftSmall, setPrevL1LeftSmall] = useState<number|null>(null);
  const [diffL1LeftSmall, setDiffL1LeftSmall] = useState<number|null>(null);
  // L1 phải bé
  const [currentL1RightSmall, setCurrentL1RightSmall] = useState<number|null>(null);
  const [prevL1RightSmall, setPrevL1RightSmall] = useState<number|null>(null);
  const [diffL1RightSmall, setDiffL1RightSmall] = useState<number|null>(null);
  // L2 trái bé
  const [currentL2LeftSmall, setCurrentL2LeftSmall] = useState<number|null>(null);
  const [prevL2LeftSmall, setPrevL2LeftSmall] = useState<number|null>(null);
  const [diffL2LeftSmall, setDiffL2LeftSmall] = useState<number|null>(null);
  // L2 phải bé
  const [currentL2RightSmall, setCurrentL2RightSmall] = useState<number|null>(null);
  const [prevL2RightSmall, setPrevL2RightSmall] = useState<number|null>(null);
  const [diffL2RightSmall, setDiffL2RightSmall] = useState<number|null>(null);
  const [currentKDTruoc, setCurrentKDTruoc] = useState<number|null>(null);
  const [prevKDTruoc, setPrevKDTruoc] = useState<number|null>(null);
  const [diffKDTruoc, setDiffKDTruoc] = useState<number|null>(null);
  const [currentKDSau, setCurrentKDSau] = useState<number|null>(null);
  const [prevKDSau, setPrevKDSau] = useState<number|null>(null);
  const [diffKDSau, setDiffKDSau] = useState<number|null>(null);
  // Tổng số điện khu chung
  const [commonElectric, setCommonElectric] = useState<number|null>(null);
  // Ref to always get latest fetchFormulaData
  const fetchFormulaData = async () => {
    // Current month
    const { data: curr } = await supabase
      .from('meter_readings')
      .select('electricity_total, l1_large, l2_large, l1_small_left, l1_small_right, l2_small_left, l2_small_right, electricity_business_before, electricity_business_after')
      .eq('reading_year', formulaYear)
      .eq('reading_month', formulaMonth)
      .maybeSingle();
    // Previous month
    let prevMonth = formulaMonth - 1;
    let prevYear = formulaYear;
    if (prevMonth < 1) {
      prevMonth = 12;
      prevYear = formulaYear - 1;
    }
    const { data: prev } = await supabase
      .from('meter_readings')
      .select('electricity_total, l1_large, l2_large, l1_small_left, l1_small_right, l2_small_left, l2_small_right, electricity_business_before, electricity_business_after')
      .eq('reading_year', prevYear)
      .eq('reading_month', prevMonth)
      .maybeSingle();
    // Tổng số điện tổng
    setCurrentElectric(curr?.electricity_total ?? null);
    setPrevElectric(prev?.electricity_total ?? null);
    let totalDiff = null;
    if (curr?.electricity_total != null && prev?.electricity_total != null) {
      totalDiff = Number(curr.electricity_total) - Number(prev.electricity_total);
      setElectricDiff(totalDiff);
    } else {
      setElectricDiff(null);
    }
    // Tính tổng các khu còn lại theo công thức mới
    const fields = [
      'electricity_business_before',
      'electricity_business_after',
      'l1_small_left',
      'l1_small_right',
      'l1_large',
      'l2_small_left',
      'l2_small_right',
      'l2_large',
    ];
    let sumCurrent = 0;
    let sumPrev = 0;
    let allCurrentPresent = true;
    let allPrevPresent = true;
    for (const f of fields) {
      if ((curr as any)?.[f] == null) allCurrentPresent = false;
      if ((prev as any)?.[f] == null) allPrevPresent = false;
    }
    if (curr && prev && totalDiff !== null && allCurrentPresent && allPrevPresent) {
      for (const f of fields) {
        sumCurrent += Number((curr as any)[f] ?? 0);
        sumPrev += Number((prev as any)[f] ?? 0);
      }
      setCommonElectric(totalDiff - (sumCurrent - sumPrev));
    } else {
      setCommonElectric(null);
    }
    // L1 lớn
    setCurrentL1(curr?.l1_large ?? null);
    setPrevL1(prev?.l1_large ?? null);
    if (curr?.l1_large != null && prev?.l1_large != null) {
      setDiffL1(Number(curr.l1_large) - Number(prev.l1_large));
    } else {
      setDiffL1(null);
    }
    // L2 lớn
    setCurrentL2(curr?.l2_large ?? null);
    setPrevL2(prev?.l2_large ?? null);
    if (curr?.l2_large != null && prev?.l2_large != null) {
      setDiffL2(Number(curr.l2_large) - Number(prev.l2_large));
    } else {
      setDiffL2(null);
    }
    // L1 trái bé
    setCurrentL1LeftSmall(curr?.l1_small_left ?? null);
    setPrevL1LeftSmall(prev?.l1_small_left ?? null);
    if (curr?.l1_small_left != null && prev?.l1_small_left != null) {
      setDiffL1LeftSmall(Number(curr.l1_small_left) - Number(prev.l1_small_left));
    } else {
      setDiffL1LeftSmall(null);
    }
    // L1 phải bé
    setCurrentL1RightSmall(curr?.l1_small_right ?? null);
    setPrevL1RightSmall(prev?.l1_small_right ?? null);
    if (curr?.l1_small_right != null && prev?.l1_small_right != null) {
      setDiffL1RightSmall(Number(curr.l1_small_right) - Number(prev.l1_small_right));
    } else {
      setDiffL1RightSmall(null);
    }
    // L2 trái bé
    setCurrentL2LeftSmall(curr?.l2_small_left ?? null);
    setPrevL2LeftSmall(prev?.l2_small_left ?? null);
    if (curr?.l2_small_left != null && prev?.l2_small_left != null) {
      setDiffL2LeftSmall(Number(curr.l2_small_left) - Number(prev.l2_small_left));
    } else {
      setDiffL2LeftSmall(null);
    }
    // L2 phải bé
    setCurrentL2RightSmall(curr?.l2_small_right ?? null);
    setPrevL2RightSmall(prev?.l2_small_right ?? null);
    if (curr?.l2_small_right != null && prev?.l2_small_right != null) {
      setDiffL2RightSmall(Number(curr.l2_small_right) - Number(prev.l2_small_right));
    } else {
      setDiffL2RightSmall(null);
    }
    // KD Trước
    setCurrentKDTruoc(curr?.electricity_business_before ?? null);
    setPrevKDTruoc(prev?.electricity_business_before ?? null);
    if (curr?.electricity_business_before != null && prev?.electricity_business_before != null) {
      setDiffKDTruoc(Number(curr.electricity_business_before) - Number(prev.electricity_business_before));
    } else {
      setDiffKDTruoc(null);
    }
    // KD Sau
    setCurrentKDSau(curr?.electricity_business_after ?? null);
    setPrevKDSau(prev?.electricity_business_after ?? null);
    if (curr?.electricity_business_after != null && prev?.electricity_business_after != null) {
      setDiffKDSau(Number(curr.electricity_business_after) - Number(prev.electricity_business_after));
    } else {
      setDiffKDSau(null);
    }
  };

  useEffect(() => {
    if (value === 2) {
      fetchFormulaData();
    }
  }, [formulaMonth, formulaYear, value]);
  // Fetch data for selected month/year
  useEffect(() => {
    const fetchData = async () => {
  // setLoading(true); // removed unused loading state
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setFormData({
            water_total: null,
            water_business_before: null,
            water_business_after: null,
            electricity_total: null,
            electricity_business_before: null,
            electricity_business_after: null,
            l1_small_left: null,
            l1_small_right: null,
            l1_large: null,
            l2_small_left: null,
            l2_small_right: null,
            l2_large: null,
          });
          setRecordId(undefined);
          // setLoading(false); // removed unused loading state
          return;
        }
        const { data, error } = await supabase
          .from('meter_readings')
          .select('*')
          .eq('user_id', user.id)
          .eq('reading_year', selectedYear)
          .eq('reading_month', selectedMonth)
          .maybeSingle();
        if (error) {
          setFormData({
            water_total: null,
            water_business_before: null,
            water_business_after: null,
            electricity_total: null,
            electricity_business_before: null,
            electricity_business_after: null,
            l1_small_left: null,
            l1_small_right: null,
            l1_large: null,
            l2_small_left: null,
            l2_small_right: null,
            l2_large: null,
          });
          setRecordId(undefined);
        } else if (data) {
          setFormData({
            water_total: data.water_total,
            water_business_before: data.water_business_before,
            water_business_after: data.water_business_after,
            electricity_total: data.electricity_total,
            electricity_business_before: data.electricity_business_before,
            electricity_business_after: data.electricity_business_after,
            l1_small_left: data.l1_small_left,
            l1_small_right: data.l1_small_right,
            l1_large: data.l1_large,
            l2_small_left: data.l2_small_left,
            l2_small_right: data.l2_small_right,
            l2_large: data.l2_large,
          });
          setRecordId(data.id ? String(data.id) : undefined);
        } else {
          setFormData({
            water_total: null,
            water_business_before: null,
            water_business_after: null,
            electricity_total: null,
            electricity_business_before: null,
            electricity_business_after: null,
            l1_small_left: null,
            l1_small_right: null,
            l1_large: null,
            l2_small_left: null,
            l2_small_right: null,
            l2_large: null,
          });
          setRecordId(undefined);
        }
      } finally {
        // setLoading(false); // removed unused loading state
      }
    };
    fetchData();
  }, [selectedYear, selectedMonth]);

  const handleYearChange = (event: SelectChangeEvent<number>) => {
    setSelectedYear(Number(event.target.value));
  };
  const handleMonthChange = (event: SelectChangeEvent<number>) => {
    setSelectedMonth(Number(event.target.value));
  };

  const handleInputChange = (field: keyof MeterReading) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value === '' ? null : Number(event.target.value);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveReadings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Vui lòng đăng nhập trước khi lưu chỉ số');
        return;
      }


      // Remove id from formData if present (for update)
      const { id, ...formDataWithoutId } = formData;
      const readingsData = {
        user_id: user.id,
        reading_date: new Date().toISOString().split('T')[0],
        reading_year: selectedYear,
        reading_month: selectedMonth,
        ...formDataWithoutId,
      };

      let error;
      if (recordId) {
        // Update existing
        ({ error } = await supabase
          .from('meter_readings')
          .update(readingsData)
          .eq('id', recordId));
      } else {
        // Insert new
        ({ error } = await supabase
          .from('meter_readings')
          .insert([readingsData]));
      }

      if (error) {
        console.error('Database error:', error);
        alert('Lỗi khi lưu chỉ số: ' + (error.message || error.details || JSON.stringify(error)));
        return;
      }

      alert('Đã lưu chỉ số thành công!');
      // Refetch to update state
      setTimeout(() => {
        // trigger refetch
        setSelectedMonth(m => m);
      }, 100);
    } catch (error) {
      console.error('Error saving readings:', error);
      alert('Lỗi khi lưu chỉ số (exception): ' + (error instanceof Error ? error.message : JSON.stringify(error)));
    }
  };

  const handleChange = async (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    if (newValue === 1) {
      // Fetch all records from meter_readings (ignore user)
      setHistoryLoading(true);
      try {
        const { data, error } = await supabase
          .from('meter_readings')
          .select('*')
          .order('reading_year', { ascending: false })
          .order('reading_month', { ascending: false });
        if (error) {
          setHistory([]);
        } else {
          setHistory(data || []);
        }
      } finally {
        setHistoryLoading(false);
      }
    } else if (newValue === 2) {
      // Refresh formula data immediately when switching to Công thức tab
      fetchFormulaData();
    }
  };

  const handleLogout = () => {
    // TODO: Implement logout functionality
    console.log('Logging out...');
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            HomeCare
          </Typography>
          <IconButton
            size="large"
            edge="end"
            color="inherit"
            onClick={handleLogout}
            aria-label="logout"
          >
            <LogoutIcon />
          </IconButton>
        </Toolbar>
        <Tabs 
          value={value} 
          onChange={handleChange} 
          aria-label="main tabs"
          centered
          sx={{
            '& .MuiTab-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-selected': {
                color: '#ffffff',
              },
            },
          }}
        >
          <Tab label="Nhập Chỉ Số" />
          <Tab label="Lịch Sử" />
          <Tab label="Công thức" />
        </Tabs>
      <CustomTabPanel value={value} index={2}>
        <Box
          sx={{
            mt: 3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            width: '100%',
            minHeight: '60vh',
          }}
        >
          <Paper
            elevation={2}
            sx={{
              width: '100%',
              maxWidth: 420,
              bgcolor: '#fff',
              borderRadius: 3,
              p: { xs: 2, sm: 3 },
              mx: 'auto',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', fontWeight: 600 }}>
              Công thức tính toán
            </Typography>
            <Box sx={{ height: 8 }} />
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, width: '100%' }} />
            <Box sx={{ display: 'flex', gap: 2, mb: 3, width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="formula-year-label">Năm</InputLabel>
                <Select
                  labelId="formula-year-label"
                  value={formulaYear}
                  label="Năm"
                  onChange={e => setFormulaYear(Number(e.target.value))}
                >
                  {Array.from({ length: 26 }, (_, i) => 2025 + i).map((year) => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel id="formula-month-label">Tháng</InputLabel>
                <Select
                  labelId="formula-month-label"
                  value={formulaMonth}
                  label="Tháng"
                  onChange={e => setFormulaMonth(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <MenuItem key={month} value={month}>Tháng {month}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            {/* ...existing formula content... */}
            <Divider sx={{ my: 2, width: '100%' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, width: '100%' }}>
              Tổng số điện khu chung (Kwh)
            </Typography>
            <Typography variant="body1" sx={{ width: '100%' }}>
              <b>Kết quả: {commonElectric !== null ? commonElectric : '--'} Kwh</b>
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, width: '100%' }}>
              Tổng số điện Kwh
            </Typography>
            <Typography variant="body1" sx={{ width: '100%' }}>
              Số điện tháng hiện tại: <b>{currentElectric ?? '--'}</b>
            </Typography>
            <Typography variant="body1" sx={{ width: '100%' }}>
              Số điện tháng trước: <b>{prevElectric ?? '--'}</b>
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, width: '100%' }}>
              <b>Kết quả: {electricDiff !== null ? electricDiff : '--'} Kwh</b>
            </Typography>
            <Divider sx={{ my: 2, width: '100%' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, width: '100%' }}>
              Tổng số điện L1 lớn (Kwh)
            </Typography>
            <Typography variant="body1" sx={{ width: '100%' }}>
              L1 lớn tháng hiện tại: <b>{currentL1 ?? '--'}</b>
            </Typography>
            <Typography variant="body1" sx={{ width: '100%' }}>
              L1 lớn tháng trước: <b>{prevL1 ?? '--'}</b>
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, width: '100%' }}>
              <b>Kết quả: {diffL1 !== null ? diffL1 : '--'} Kwh</b>
            </Typography>
            <Divider sx={{ my: 2, width: '100%' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, width: '100%' }}>
              Tổng số điện L2 lớn (Kwh)
            </Typography>
            <Typography variant="body1" sx={{ width: '100%' }}>
              L2 lớn tháng hiện tại: <b>{currentL2 ?? '--'}</b>
            </Typography>
            <Typography variant="body1" sx={{ width: '100%' }}>
              L2 lớn tháng trước: <b>{prevL2 ?? '--'}</b>
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, width: '100%' }}>
              <b>Kết quả: {diffL2 !== null ? diffL2 : '--'} Kwh</b>
            </Typography>
            <Divider sx={{ my: 2, width: '100%' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, width: '100%' }}>
              Tổng số điện L1 trái bé (Kwh)
            </Typography>
            <Typography variant="body1" sx={{ width: '100%' }}>
              L1 trái bé tháng hiện tại: <b>{currentL1LeftSmall ?? '--'}</b>
            </Typography>
            <Typography variant="body1" sx={{ width: '100%' }}>
              L1 trái bé tháng trước: <b>{prevL1LeftSmall ?? '--'}</b>
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, width: '100%' }}>
              <b>Kết quả: {diffL1LeftSmall !== null ? diffL1LeftSmall : '--'} Kwh</b>
            </Typography>
            <Divider sx={{ my: 2, width: '100%' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, width: '100%' }}>
              Tổng số điện L1 phải bé (Kwh)
            </Typography>
            <Typography variant="body1" sx={{ width: '100%' }}>
              L1 phải bé tháng hiện tại: <b>{currentL1RightSmall ?? '--'}</b>
            </Typography>
            <Typography variant="body1" sx={{ width: '100%' }}>
              L1 phải bé tháng trước: <b>{prevL1RightSmall ?? '--'}</b>
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, width: '100%' }}>
              <b>Kết quả: {diffL1RightSmall !== null ? diffL1RightSmall : '--'} Kwh</b>
            </Typography>
            <Divider sx={{ my: 2, width: '100%' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, width: '100%' }}>
              Tổng số điện L2 trái bé (Kwh)
            </Typography>
            <Typography variant="body1" sx={{ width: '100%' }}>
              L2 trái bé tháng hiện tại: <b>{currentL2LeftSmall ?? '--'}</b>
            </Typography>
            <Typography variant="body1" sx={{ width: '100%' }}>
              L2 trái bé tháng trước: <b>{prevL2LeftSmall ?? '--'}</b>
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, width: '100%' }}>
              <b>Kết quả: {diffL2LeftSmall !== null ? diffL2LeftSmall : '--'} Kwh</b>
            </Typography>
            <Divider sx={{ my: 2, width: '100%' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, width: '100%' }}>
              Tổng số điện L2 phải bé (Kwh)
            </Typography>
            <Typography variant="body1" sx={{ width: '100%' }}>
              L2 phải bé tháng hiện tại: <b>{currentL2RightSmall ?? '--'}</b>
            </Typography>
            <Typography variant="body1" sx={{ width: '100%' }}>
              L2 phải bé tháng trước: <b>{prevL2RightSmall ?? '--'}</b>
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, width: '100%' }}>
              <b>Kết quả: {diffL2RightSmall !== null ? diffL2RightSmall : '--'} Kwh</b>
            </Typography>
            <Divider sx={{ my: 2, width: '100%' }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, width: '100%' }}>
              Tổng số điện trệt (Kwh)
            </Typography>
            <Typography variant="body1" sx={{ width: '100%' }}>
              KD Trước tháng hiện tại: <b>{currentKDTruoc ?? '--'}</b>
            </Typography>
            <Typography variant="body1" sx={{ width: '100%' }}>
              KD Trước tháng trước: <b>{prevKDTruoc ?? '--'}</b>
            </Typography>
            <Typography variant="body1" sx={{ width: '100%' }}>
              KD Sau tháng hiện tại: <b>{currentKDSau ?? '--'}</b>
            </Typography>
            <Typography variant="body1" sx={{ width: '100%' }}>
              KD Sau tháng trước: <b>{prevKDSau ?? '--'}</b>
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, width: '100%' }}>
              <b>Kết quả: {(diffKDTruoc !== null && diffKDSau !== null) ? (diffKDTruoc + diffKDSau) : '--'} Kwh</b>
            </Typography>
          </Paper>
        </Box>
      </CustomTabPanel>
      </AppBar>

      <CustomTabPanel value={value} index={0}>
        <Box
          sx={{
            maxWidth: { xs: '100%', sm: 400, md: 600 },
            mx: 'auto',
            p: { xs: 1, sm: 2 },
            width: '100%',
          }}
        >
          {/* Month/Year Selectors */}
          <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2}>
              <FormControl fullWidth>
                <InputLabel id="year-select-label">Năm</InputLabel>
                <Select
                  labelId="year-select-label"
                  value={selectedYear}
                  label="Năm"
                  onChange={handleYearChange}
                >
                  {Array.from({ length: 26 }, (_, i) => 2025 + i).map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="month-select-label">Tháng</InputLabel>
                <Select
                  labelId="month-select-label"
                  value={selectedMonth}
                  label="Tháng"
                  onChange={handleMonthChange}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <MenuItem key={month} value={month}>
                      Tháng {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Paper>
          {/* Water Meter Block */}
          <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Số Nước
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <Box sx={{ mb: 2 }}>
                <Typography component="label" htmlFor="water_total" sx={{ fontWeight: 500, fontSize: '1rem', color: '#222', mb: 0.5, display: 'block' }}>
                  Số Nước Tổng
                </Typography>
                <TextField
                  id="water_total"
                  fullWidth
                  label=""
                  type="number"
                  value={formData.water_total || ''}
                  onChange={handleInputChange('water_total')}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box display="flex" gap={2}>
                <Box sx={{ flex: 1, mr: 1 }}>
                  <Typography component="label" htmlFor="water_business_before" sx={{ fontWeight: 500, fontSize: '1rem', color: '#222', mb: 0.5, display: 'block' }}>
                    Số Nước KD Trước
                  </Typography>
                  <TextField
                    id="water_business_before"
                    fullWidth
                    label=""
                    type="number"
                    value={formData.water_business_before || ''}
                    onChange={handleInputChange('water_business_before')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <Box sx={{ flex: 1, ml: 1 }}>
                  <Typography component="label" htmlFor="water_business_after" sx={{ fontWeight: 500, fontSize: '1rem', color: '#222', mb: 0.5, display: 'block' }}>
                    Số Nước KD Sau
                  </Typography>
                  <TextField
                    id="water_business_after"
                    fullWidth
                    label=""
                    type="number"
                    value={formData.water_business_after || ''}
                    onChange={handleInputChange('water_business_after')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Electricity Meter Block */}
          <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 } }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Số Điện
            </Typography>
            
            {/* Ground Floor Block */}
            <Paper variant="outlined" sx={{ p: { xs: 1, sm: 2 }, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                Khu Trệt
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box sx={{ mb: 2 }}>
                  <Typography component="label" htmlFor="electricity_total" sx={{ fontWeight: 500, fontSize: '1rem', color: '#222', mb: 0.5, display: 'block' }}>
                    Số Điện Tổng
                  </Typography>
                  <TextField
                    id="electricity_total"
                    fullWidth
                    label=""
                    type="number"
                    value={formData.electricity_total || ''}
                    onChange={handleInputChange('electricity_total')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <Box display="flex" gap={2}>
                  <Box sx={{ flex: 1, mr: 1 }}>
                    <Typography component="label" htmlFor="electricity_business_before" sx={{ fontWeight: 500, fontSize: '1rem', color: '#222', mb: 0.5, display: 'block' }}>
                      Số Điện KD Trước
                    </Typography>
                    <TextField
                      id="electricity_business_before"
                      fullWidth
                      label=""
                      type="number"
                      value={formData.electricity_business_before || ''}
                      onChange={handleInputChange('electricity_business_before')}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                  <Box sx={{ flex: 1, ml: 1 }}>
                    <Typography component="label" htmlFor="electricity_business_after" sx={{ fontWeight: 500, fontSize: '1rem', color: '#222', mb: 0.5, display: 'block' }}>
                      Số Điện KD Sau
                    </Typography>
                    <TextField
                      id="electricity_business_after"
                      fullWidth
                      label=""
                      type="number"
                      value={formData.electricity_business_after || ''}
                      onChange={handleInputChange('electricity_business_after')}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* L1 Floor Block */}
            <Paper variant="outlined" sx={{ p: { xs: 1, sm: 2 }, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                Khu L1
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box sx={{ mb: 2 }}>
                  <Typography component="label" htmlFor="l1_large" sx={{ fontWeight: 500, fontSize: '1rem', color: '#222', mb: 0.5, display: 'block' }}>
                    L1 Lớn
                  </Typography>
                  <TextField
                    id="l1_large"
                    fullWidth
                    label=""
                    type="number"
                    value={formData.l1_large || ''}
                    onChange={handleInputChange('l1_large')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <Box display="flex" gap={2}>
                  <Box sx={{ flex: 1, mr: 1 }}>
                    <Typography component="label" htmlFor="l1_small_left" sx={{ fontWeight: 500, fontSize: '1rem', color: '#222', mb: 0.5, display: 'block' }}>
                      L1 Trái Bé
                    </Typography>
                    <TextField
                      id="l1_small_left"
                      fullWidth
                      label=""
                      type="number"
                      value={formData.l1_small_left || ''}
                      onChange={handleInputChange('l1_small_left')}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                  <Box sx={{ flex: 1, ml: 1 }}>
                    <Typography component="label" htmlFor="l1_small_right" sx={{ fontWeight: 500, fontSize: '1rem', color: '#222', mb: 0.5, display: 'block' }}>
                      L1 Phải Bé
                    </Typography>
                    <TextField
                      id="l1_small_right"
                      fullWidth
                      label=""
                      type="number"
                      value={formData.l1_small_right || ''}
                      onChange={handleInputChange('l1_small_right')}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>

            {/* L2 Floor Block */}
            <Paper variant="outlined" sx={{ p: { xs: 1, sm: 2 } }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                Khu L2
              </Typography>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box sx={{ mb: 2 }}>
                  <Typography component="label" htmlFor="l2_large" sx={{ fontWeight: 500, fontSize: '1rem', color: '#222', mb: 0.5, display: 'block' }}>
                    L2 Lớn
                  </Typography>
                  <TextField
                    id="l2_large"
                    fullWidth
                    label=""
                    type="number"
                    value={formData.l2_large || ''}
                    onChange={handleInputChange('l2_large')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
                <Box display="flex" gap={2}>
                  <Box sx={{ flex: 1, mr: 1 }}>
                    <Typography component="label" htmlFor="l2_small_left" sx={{ fontWeight: 500, fontSize: '1rem', color: '#222', mb: 0.5, display: 'block' }}>
                      L2 Trái Bé
                    </Typography>
                    <TextField
                      id="l2_small_left"
                      fullWidth
                      label=""
                      type="number"
                      value={formData.l2_small_left || ''}
                      onChange={handleInputChange('l2_small_left')}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                  <Box sx={{ flex: 1, ml: 1 }}>
                    <Typography component="label" htmlFor="l2_small_right" sx={{ fontWeight: 500, fontSize: '1rem', color: '#222', mb: 0.5, display: 'block' }}>
                      L2 Phải Bé
                    </Typography>
                    <TextField
                      id="l2_small_right"
                      fullWidth
                      label=""
                      type="number"
                      value={formData.l2_small_right || ''}
                      onChange={handleInputChange('l2_small_right')}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Paper>

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2, fontSize: { xs: '1rem', sm: '1.1rem' }, py: 1.5 }}
            onClick={handleSaveReadings}
          >
            Lưu Chỉ Số
          </Button>
        </Box>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <Typography variant="h5" gutterBottom>
          Lịch Sử
        </Typography>
        {historyLoading ? (
          <Typography>Đang tải dữ liệu...</Typography>
        ) : history.length === 0 ? (
          <Typography>Không có dữ liệu lịch sử.</Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
              <thead>
                <tr style={{ background: '#f0f0f0' }}>
                  <th style={{ padding: 8, border: '1px solid #ddd' }}>Năm</th>
                  <th style={{ padding: 8, border: '1px solid #ddd' }}>Tháng</th>
                  <th style={{ padding: 8, border: '1px solid #ddd' }}>Ngày nhập</th>
                  <th style={{ padding: 8, border: '1px solid #ddd' }}>Thời gian cập nhật</th>
                  <th style={{ padding: 8, border: '1px solid #ddd' }}>Số Nước Tổng</th>
                  <th style={{ padding: 8, border: '1px solid #ddd' }}>Số Nước KD Trước</th>
                  <th style={{ padding: 8, border: '1px solid #ddd' }}>Số Nước KD Sau</th>
                  <th style={{ padding: 8, border: '1px solid #ddd' }}>Số Điện Tổng</th>
                  <th style={{ padding: 8, border: '1px solid #ddd' }}>Số Điện KD Trước</th>
                  <th style={{ padding: 8, border: '1px solid #ddd' }}>Số Điện KD Sau</th>
                  <th style={{ padding: 8, border: '1px solid #ddd' }}>L1 Trái Bé</th>
                  <th style={{ padding: 8, border: '1px solid #ddd' }}>L1 Phải Bé</th>
                  <th style={{ padding: 8, border: '1px solid #ddd' }}>L1 Lớn</th>
                  <th style={{ padding: 8, border: '1px solid #ddd' }}>L2 Trái Bé</th>
                  <th style={{ padding: 8, border: '1px solid #ddd' }}>L2 Phải Bé</th>
                  <th style={{ padding: 8, border: '1px solid #ddd' }}>L2 Lớn</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row) => (
                  <tr key={row.id}>
                    <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'center' }}>{row.reading_year}</td>
                    <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'center' }}>{row.reading_month}</td>
                    <td style={{ padding: 8, border: '1px solid #ddd' }}>{row.reading_date || ''}</td>
                    <td style={{ padding: 8, border: '1px solid #ddd' }}>{row.updated_at ? new Date(row.updated_at).toLocaleString() : ''}</td>
                    <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>{row.water_total ?? ''}</td>
                    <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>{row.water_business_before ?? ''}</td>
                    <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>{row.water_business_after ?? ''}</td>
                    <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>{row.electricity_total ?? ''}</td>
                    <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>{row.electricity_business_before ?? ''}</td>
                    <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>{row.electricity_business_after ?? ''}</td>
                    <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>{row.l1_small_left ?? ''}</td>
                    <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>{row.l1_small_right ?? ''}</td>
                    <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>{row.l1_large ?? ''}</td>
                    <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>{row.l2_small_left ?? ''}</td>
                    <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>{row.l2_small_right ?? ''}</td>
                    <td style={{ padding: 8, border: '1px solid #ddd', textAlign: 'right' }}>{row.l2_large ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        )}
      </CustomTabPanel>
    </Box>
  );
};
