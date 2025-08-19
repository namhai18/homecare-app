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
  Button
} from '@mui/material';
import { supabase } from '../lib/supabase';
import type { MeterReading } from '../types/meterReading';
import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import { MenuItem, Select, FormControl, InputLabel } from '@mui/material';
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
  // const [loading, setLoading] = useState(false); // removed unused variable

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

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
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
        </Tabs>
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
            <Grid container spacing={2}>
              <Grid item xs={6}>
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
              </Grid>
              <Grid item xs={6}>
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
              </Grid>
            </Grid>
          </Paper>
          {/* Water Meter Block */}
          <Paper elevation={2} sx={{ p: { xs: 1, sm: 2 }, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
              Số Nước
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Số Nước Tổng"
                  type="number"
                  value={formData.water_total || ''}
                  onChange={handleInputChange('water_total')}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Số Nước KD Trước"
                  type="number"
                  value={formData.water_business_before || ''}
                  onChange={handleInputChange('water_business_before')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Số Nước KD Sau"
                  type="number"
                  value={formData.water_business_after || ''}
                  onChange={handleInputChange('water_business_after')}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
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
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Số Điện Tổng"
                    type="number"
                    value={formData.electricity_total || ''}
                    onChange={handleInputChange('electricity_total')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Số Điện KD Trước"
                    type="number"
                    value={formData.electricity_business_before || ''}
                    onChange={handleInputChange('electricity_business_before')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Số Điện KD Sau"
                    type="number"
                    value={formData.electricity_business_after || ''}
                    onChange={handleInputChange('electricity_business_after')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* L1 Floor Block */}
            <Paper variant="outlined" sx={{ p: { xs: 1, sm: 2 }, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                Khu L1
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="L1 Lớn"
                    type="number"
                    value={formData.l1_large || ''}
                    onChange={handleInputChange('l1_large')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="L1 Trái Bé"
                    type="number"
                    value={formData.l1_small_left || ''}
                    onChange={handleInputChange('l1_small_left')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="L1 Phải Bé"
                    type="number"
                    value={formData.l1_small_right || ''}
                    onChange={handleInputChange('l1_small_right')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* L2 Floor Block */}
            <Paper variant="outlined" sx={{ p: { xs: 1, sm: 2 } }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                Khu L2
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="L2 Lớn"
                    type="number"
                    value={formData.l2_large || ''}
                    onChange={handleInputChange('l2_large')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="L2 Trái Bé"
                    type="number"
                    value={formData.l2_small_left || ''}
                    onChange={handleInputChange('l2_small_left')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="L2 Phải Bé"
                    type="number"
                    value={formData.l2_small_right || ''}
                    onChange={handleInputChange('l2_small_right')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
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
      </CustomTabPanel>
    </Box>
  );
};
