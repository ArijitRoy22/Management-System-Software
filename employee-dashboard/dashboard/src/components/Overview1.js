import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GradientPieChart from './GradientPieChart'; // Import the new GradientPieChart component
import LineChart from './LineChart'; // Import the LineChart component
import './Overview.css';

const Overview = () => {
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [departmentCounts, setDepartmentCounts] = useState({});
    const [employees, setEmployees] = useState([]); // List of all employees with department
    const [selectedEmployee, setSelectedEmployee] = useState(''); // Selected employee name
    const [statusCounts, setStatusCounts] = useState({});
    const [totalTime, setTotalTime] = useState('0 hours 0 minutes');
    const [filterType, setFilterType] = useState('default');
    const [filterValue, setFilterValue] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [lineChartData, setLineChartData] = useState([]);
    const [breakLineChartData, setBreakLineChartData] = useState([]);
    const [totalLineChartData, setTotalLineChartData] = useState([]);
    const [totalBreakLineChartData, setTotalBreakLineChartData] = useState([]);

    const convertToMinutes = (time) => {
        const [hours, decimalMinutes] = time.split('.').map(Number);
        const minutes = Math.round(decimalMinutes);
        return (hours * 60) + minutes
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5001/data');
                const csvData = response.data;

                const uniqueNames = new Set(csvData.map(item => item.emp_name));
                setTotalEmployees(uniqueNames.size);


                const uniqueEmployees = Array.from(new Set(csvData.map(item => `${item.emp_name}:${item.department}`)))
                    .map(emp => {
                        const [name, department] = emp.split(':');
                        return { name, department };
                    });
                setEmployees(uniqueEmployees);

                const deptCounts = csvData.reduce((acc, item) => {
                    if (!acc[item.department]) {
                        acc[item.department] = new Set();
                    }
                    acc[item.department].add(item.emp_name);
                    return acc;
                }, {});
                const departmentCountMap = Object.keys(deptCounts).reduce((acc, department) => {
                    acc[department] = deptCounts[department].size;
                    return acc;
                }, {});
                setDepartmentCounts(departmentCountMap);

                let filteredData = csvData;

                if (selectedEmployee) {
                    filteredData = filteredData.filter(item => item.emp_name === selectedEmployee);
                }

                if (filterType === 'day') {
                    filteredData = filteredData.filter(item => item.date === filterValue);
                } else if (filterType === 'week') {
                    filteredData = filteredData.filter(item => item.date >= startDate && item.date <= endDate);
                } else if (filterType === 'month') {
                    filteredData = filteredData.filter(item => item.date.startsWith(filterValue));
                }

                const statusCounts = filteredData.reduce((acc, item) => {
                    acc[item.status] = (acc[item.status] || 0) + 1;
                    return acc;
                }, {});
                setStatusCounts(statusCounts);

                let totalMinutes = filteredData.reduce((acc, item) => acc + convertToMinutes(item.total_hrs), 0);

                let overflowMinutes = totalMinutes % 60;
                let overflowHours = Math.floor(totalMinutes / 60);

                setTotalTime(`${overflowHours} hours ${overflowMinutes} minutes`);

                const lineChartData = filteredData.map(item => ({
                    date: item.date,
                    value: convertToMinutes(item.total_hrs)
                }));

                const breakLineChartData = filteredData.map(item => ({
                    date: item.date,
                    value: convertToMinutes(item.break)
                }));

                const totalLineChartData = filteredData.reduce((acc, item) => {
                    const month = item.date.substring(0, 7);
                    if (!acc[month]) {
                        acc[month] = 0;
                    }
                    acc[month] += convertToMinutes(item.total_hrs);
                    return acc;
                }, {});

                const totalBreakLineChartData = filteredData.reduce((acc, item) => {
                    const month = item.date.substring(0, 7);
                    if (!acc[month]) {
                        acc[month] = 0;
                    }
                    acc[month] += convertToMinutes(item.break);
                    return acc;
                }, {});

                setLineChartData(lineChartData);
                setBreakLineChartData(breakLineChartData);
                setTotalLineChartData(Object.entries(totalLineChartData).map(([month, value]) => ({ period: month, value })));
                setTotalBreakLineChartData(Object.entries(totalBreakLineChartData).map(([month, value]) => ({ period: month, value })));

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 2000);

        return () => clearInterval(interval);
    }, [selectedEmployee, filterType, filterValue, startDate, endDate]);

    const handleFilterChange = (e) => {
        setFilterType(e.target.value);
        setFilterValue(' '); // Reset filter value when changing type
        setStartDate('');
        setEndDate('');
    };

    const handleFilterValueChange = (e) => {
        setFilterValue(e.target.value);
    };

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    };

    const handleEmployeeChange = (e) => {
        setSelectedEmployee(e.target.value);
    };

    return (
        <div className='Overview-container'>
            <h1 className='title'>Employee Time Sheet</h1>
            <div className='filter-container'>
                <select value={selectedEmployee} onChange={handleEmployeeChange}>
                    <option value=''>Select Employee</option>
                    {employees.map(emp => (
                        <option key={emp.name} value={emp.name}>{emp.name}</option>
                    ))}
                </select>
                <select value={filterType} onChange={handleFilterChange}>
                    <option value='default'>Default</option>
                    <option value='day'>Day</option>
                    <option value='week'>Week</option>
                    <option value='month'>Month</option>
                </select>

                {filterType === 'day' && (
                    <input
                        type='date'
                        value={filterValue}
                        onChange={handleFilterValueChange}
                    />
                )}

                {filterType === 'week' && (
                    <>
                        <input
                            type='date'
                            value={startDate}
                            onChange={handleStartDateChange}
                        />
                        <input
                            type='date'
                            value={endDate}
                            onChange={handleEndDateChange}
                        />
                    </>
                )}

                {filterType === 'month' && (
                    <select value={filterValue} onChange={handleFilterValueChange}>
                        <option value='2024-01'>January</option>
                        <option value='2024-02'>February</option>
                        <option value='2024-03'>March</option>
                        <option value='2024-04'>April</option>
                        <option value='2024-05'>May</option>
                        <option value='2024-06'>June</option>
                        <option value='2024-07'>July</option>
                        <option value='2024-08'>August</option>
                        <option value='2024-09'>September</option>
                        <option value='2024-10'>October</option>
                        <option value='2024-11'>November</option>
                        <option value='2024-12'>December</option>
                    </select>
                )}
            </div>
            
            <div className='EmployeeTable'>
                    <h2>Employees Details</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Employee Name</th>
                                <th>Department</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((employee, index) => (
                                <tr key={index}>
                                    <td>{employee.name}</td>
                                    <td>{employee.department}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
            </div>

            <div className='counts-container'>
                <p className='EmployeeCount'>Total Number of Employees: {totalEmployees}</p>
                <p className='TimeCount1'>Total Time: {totalTime}</p>
            </div>

            <div className='final-container'>
                <div className='chart-container'>
                    <div className='chart1'>
                        <h2>Status Breakdown</h2>
                        <GradientPieChart
                            data={Object.entries(statusCounts).map(([key, value]) => ({ name: key, value }))}
                        />
                    </div>
                </div>

                <div className='chart-container'>
                    <div className='chart2'>
                        <h2>Department Breakdown</h2>
                        <GradientPieChart
                            data={Object.entries(departmentCounts).map(([key, value]) => ({ name: key, value }))}
                        />
                    </div>
                </div>
            </div>

            <div className='final-container1'>
                <div className='chart-container1'>
                    <div className='line-chart1'>
                        <h2>Monthly Total Time</h2>
                        <LineChart
                            data={lineChartData}
                            totalData={totalLineChartData}
                            title="Total Time"
                            xaxisTitle="Date"
                            yaxisTitle="Total Time (Hours)"
                            showTotalPoint={true}
                            isDefault={filterType === 'default'}
                        />
                    </div>
                </div>

                <div className='chart-container1'>
                    <div className='line-chart2'>
                        <h2>Monthly Break Time</h2>
                        <LineChart
                            data={breakLineChartData}
                            totalData={totalBreakLineChartData}
                            title="Break Time"
                            xaxisTitle="Date"
                            yaxisTitle="Break Time (Hours)"
                            showTotalPoint={true}
                            isDefault={filterType === 'default'}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
