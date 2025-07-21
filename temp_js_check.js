    <script>
        function showTab(tabName) {
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Remove active class from all nav chips
            const navChips = document.querySelectorAll('.nav-chip');
            navChips.forEach(chip => chip.classList.remove('active'));
            
            // Show selected tab
            document.getElementById(tabName).classList.add('active');
            
            // Find and activate the correct nav chip
            const activeChip = document.querySelector(`[data-tab="${tabName}"]`);
            if (activeChip) {
                activeChip.classList.add('active');
            }
            
            // Move management sections to top based on tab
            moveManagementToTop(tabName);
        }

        function moveManagementToTop(tabName) {
            const tabContent = document.getElementById(tabName);
            
            if (tabName === 'employees') {
                // Smart Employee Management is already at the top in employees tab
                console.log('Smart Employee Management positioned at top of Employees tab');
            } else if (tabName === 'volunteers') {
                // Volunteer Management is already at the top in volunteers tab  
                console.log('Volunteer Management positioned at top of Volunteers tab');
            } else if (tabName === 'qr-system') {
                // Employee QR System is already at the top in QR System tab
                console.log('Employee QR System positioned at top of QR System tab');
            }
        }

        function addNewShift() {
            showNotification('Shift creation modal would open here', 'success');
        }

        function generateQRCodes() {
            window.open('/employee-geo-qr-system.html', '_blank');
        }

        // Calendar View Functions
        function switchToView(viewType) {
            // Update active toggle button
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            event.target.classList.add('active');
            
            // Show/hide appropriate view
            const calendarView = document.getElementById('calendar-view');
            const listView = document.getElementById('list-view');
            
            if (viewType === 'calendar') {
                calendarView.style.display = 'block';
                listView.style.display = 'none';
            } else {
                calendarView.style.display = 'none';
                listView.style.display = 'block';
            }
            
            showNotification(`Switched to ${viewType} view`, 'success');
        }

        function navigateWeek(direction) {
            const weekRange = document.querySelector('.week-range');
            const direction_text = direction > 0 ? 'next' : 'previous';
            
            // Get current week dates
            const currentText = weekRange.textContent;
            const [startDate, endDate, year] = currentText.split(/[-,\s]+/);
            
            // Calculate new week
            let newStart = parseInt(startDate) + (direction * 7);
            let newEnd = parseInt(endDate) + (direction * 7);
            
            // Handle month boundaries (simplified)
            if (newStart < 1) {
                newStart = 28 + newStart;
                newEnd = newStart + 6;
            } else if (newStart > 31) {
                newStart = newStart - 31;
                newEnd = newStart + 6;
            }
            
            // Animate the change
            weekRange.style.transform = 'scale(0.95)';
            weekRange.style.opacity = '0.7';
            
            setTimeout(() => {
                weekRange.textContent = `July ${newStart} - ${newEnd}, ${year}`;
                weekRange.style.transform = 'scale(1)';
                weekRange.style.opacity = '1';
                showNotification(`Navigated to ${direction_text} week`, 'success');
            }, 200);
        }

        function editShift(shiftId) {
            // Parse shift ID to get details
            const [employee, day, startTime, endTime] = shiftId.split('-');
            const employeeNames = {
                'sarah': 'Sarah Johnson',
                'mike': 'Mike Chen',
                'jessica': 'Jessica Martinez',
                'david': 'David Wilson',
                'emma': 'Emma Davis',
                'carlos': 'Carlos Rodriguez'
            };
            
            const employeeName = employeeNames[employee] || employee;
            const dayName = day.toUpperCase();
            
            showNotification(`Editing ${employeeName}'s shift on ${dayName}`, 'success');
        }

        function editEmployee(employeeId) {
            const employeeNames = {
                'sarah': 'Sarah Johnson',
                'mike': 'Mike Chen',
                'jessica': 'Jessica Martinez',
                'david': 'David Wilson',
                'emma': 'Emma Davis',
                'carlos': 'Carlos Rodriguez'
            };
            
            const employeeName = employeeNames[employeeId] || 'Employee';
            showNotification(`Opening edit form for ${employeeName}`, 'success');
        }

        function addEmployee() {
            showAddEmployeeModal();
        }

        function addVolunteer() {
            showNotification('Add new volunteer using the form above', 'success');
        }

        // Smart Employee Management System
        let selectedEmployee = null;
        let selectedShiftTemplate = null;
        let selectedCalendarDays = [];
        
        const employees = [
            { id: 1, name: 'Riley Thompson', role: 'Cashier', rate: 16.50, status: 'Available', avatar: 'R', color: '#10b981' },
            { id: 2, name: 'Morgan Casey', role: 'Cashier', rate: 17.00, status: 'Available', avatar: 'M', color: '#10b981' },
            { id: 3, name: 'Alex Rivera', role: 'Cashier', rate: 15.75, status: 'Off', avatar: 'A', color: '#10b981' },
            { id: 4, name: 'Jordan Kim', role: 'Cashier', rate: 16.25, status: 'Scheduled', avatar: 'J', color: '#10b981' },
            { id: 5, name: 'Casey Morgan', role: 'Cashier', rate: 18.00, status: 'Available', avatar: 'C', color: '#ffd700' },
            { id: 6, name: 'Sarah Johnson', role: 'Manager', rate: 22.00, status: 'Scheduled', avatar: 'S', color: '#ff6b9d' }
        ];

        function initializeSmartEmployeeManagement() {
            console.log('Smart Employee Management positioned at top of Employees tab');
            generateSmartEmployeeCards();
            generateMultiDayCalendar();
        }

        function generateSmartEmployeeCards() {
            const smartEmployeeGrid = document.getElementById('smartEmployeeGrid');
            if (!smartEmployeeGrid) {
                console.error('Smart Employee Grid element not found');
                return;
            }
            
            smartEmployeeGrid.innerHTML = '';

            const employees = [
                { id: 'sarah', name: 'Sarah Johnson', role: 'Manager', status: 'Available', avatar: 'S', color: 'manager' },
                { id: 'mike', name: 'Mike Chen', role: 'Cashier', status: 'Available', avatar: 'M', color: 'cashier' },
                { id: 'jessica', name: 'Jessica Martinez', role: 'Sales', status: 'Scheduled', avatar: 'J', color: 'sales' },
                { id: 'david', name: 'David Wilson', role: 'Stock', status: 'Available', avatar: 'D', color: 'stock' },
                { id: 'emma', name: 'Emma Davis', role: 'Assistant', status: 'Off', avatar: 'E', color: 'assistant' },
                { id: 'carlos', name: 'Carlos Rodriguez', role: 'Security', status: 'Available', avatar: 'C', color: 'security' }
            ];

            employees.forEach(employee => {
                const card = document.createElement('div');
                card.className = 'employee-card';
                // Add status indicator colors
                let statusColor = '#00ff88'; // Available
                if (employee.status === 'Scheduled') statusColor = '#ffd700';
                if (employee.status === 'Off') statusColor = '#ff6b9d';

                card.style.cssText = `
                    background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
                    border: 1px solid rgba(255,255,255,0.2);
                    border-radius: 12px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    min-height: 120px;
                `;

                card.innerHTML = `
                    <div style="display: flex; align-items: center; margin-bottom: 12px;">
                        <div class="employee-avatar ${employee.color}" style="width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 18px; margin-right: 12px;">${employee.avatar}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: bold; color: white; font-size: 16px;">${employee.name}</div>
                            <div style="color: #94a3b8; font-size: 14px;">${employee.role}</div>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div class="status-widget">
                            <button class="status-button ${employee.status.toLowerCase()}" onclick="toggleStatusDropdown('${employee.id}')" id="status-btn-${employee.id}">
                                ${employee.status}
                            </button>
                            <div class="status-dropdown" id="status-dropdown-${employee.id}">
                                <button class="status-option available" onclick="updateEmployeeStatus('${employee.id}', 'Available')">Available</button>
                                <button class="status-option scheduled" onclick="updateEmployeeStatus('${employee.id}', 'Scheduled')">Scheduled</button>
                                <button class="status-option break" onclick="updateEmployeeStatus('${employee.id}', 'Break')">Break</button>
                                <button class="status-option off" onclick="updateEmployeeStatus('${employee.id}', 'Off')">Off</button>
                            </div>
                        </div>
                        <button style="background: linear-gradient(135deg, #00ffff, #4169e1); border: none; color: white; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;" onclick="openEmployeeScheduling(${JSON.stringify(employee).replace(/"/g, '&quot;')})">Schedule</button>
                    </div>
                `;

                // Add click handler to open scheduling interface
                card.onclick = function() {
                    openEmployeeScheduling(employee);
                };

                // Add hover effects
                card.onmouseenter = function() {
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 8px 25px rgba(0,255,255,0.3)';
                    this.style.borderColor = '#00ffff';
                };

                card.onmouseleave = function() {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = 'none';
                    this.style.borderColor = 'rgba(255,255,255,0.2)';
                };

                smartEmployeeGrid.appendChild(card);
            });
        }

        // Remove this duplicate function since openEmployeeScheduling is already defined

        function closeEmployeeScheduling() {
            selectedEmployee = null;
            selectedShiftTemplate = null;
            selectedCalendarDays = [];
            
            document.getElementById('selectedEmployeeScheduling').style.display = 'none';
            
            // Reset card styling
            document.querySelectorAll('.employee-card').forEach(card => {
                card.style.border = '2px solid rgba(255,255,255,0.1)';
                card.style.background = 'rgba(0,0,0,0.4)';
                card.style.transform = 'translateY(0)';
            });
        }

        function selectShiftTemplate(button) {
            selectedShiftTemplate = {
                start: button.dataset.start,
                end: button.dataset.end,
                name: button.textContent.split('\n')[0]
            };
            updateShiftTemplateSelection();
            updateScheduleButton();
            showNotification(`Selected ${selectedShiftTemplate.name}`, 'success');
        }

        function updateShiftTemplateSelection() {
            document.querySelectorAll('.shift-template').forEach(btn => {
                if (selectedShiftTemplate && btn.dataset.start === selectedShiftTemplate.start) {
                    btn.style.background = 'rgba(255,215,0,0.4)';
                    btn.style.borderColor = '#ffd700';
                    btn.style.transform = 'scale(1.05)';
                } else {
                    btn.style.transform = 'scale(1)';
                }
            });
        }

        function generateMultiDayCalendar() {
            const calendar = document.getElementById('multiDayCalendar');
            if (!calendar) return;
            const today = new Date();
            const firstDay = new Date(today);
            firstDay.setDate(today.getDate() - today.getDay()); // Start of week

            // Day headers
            const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            dayHeaders.forEach(day => {
                const header = document.createElement('div');
                header.style.cssText = 'text-align: center; color: #94a3b8; font-weight: bold; padding: 8px; font-size: 12px;';
                header.textContent = day;
                calendar.appendChild(header);
            });

            // Generate 4 weeks of calendar days
            for (let week = 0; week < 4; week++) {
                for (let day = 0; day < 7; day++) {
                    const currentDate = new Date(firstDay);
                    currentDate.setDate(firstDay.getDate() + (week * 7) + day);
                    
                    const dayElement = document.createElement('div');
                    dayElement.className = 'calendar-day';
                    dayElement.dataset.date = currentDate.toISOString().split('T')[0];
                    
                    const isToday = currentDate.toDateString() === today.toDateString();
                    const isPast = currentDate < today;
                    
                    dayElement.style.cssText = `
                        text-align: center;
                        padding: 12px 8px;
                        border-radius: 8px;
                        cursor: pointer;
                        border: 1px solid rgba(255,255,255,0.1);
                        transition: all 0.2s ease;
                        background: ${isPast ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)'};
                        color: ${isPast ? '#666' : 'white'};
                        ${isToday ? 'border-color: #00ffff; background: rgba(0,255,255,0.1);' : ''}
                    `;
                    
                    dayElement.innerHTML = `
                        <div style="font-size: 14px; font-weight: bold;">${currentDate.getDate()}</div>
                        <div style="font-size: 10px; opacity: 0.7;">${currentDate.toLocaleDateString('en', {month: 'short'})}</div>
                    `;
                    
                    if (!isPast) {
                        dayElement.addEventListener('click', () => toggleCalendarDay(dayElement));
                    }
                    
                    calendar.appendChild(dayElement);
                }
            }
        }

        function toggleCalendarDay(dayElement) {
            const date = dayElement.dataset.date;
            const index = selectedCalendarDays.indexOf(date);
            
            if (index === -1) {
                selectedCalendarDays.push(date);
                dayElement.style.background = 'rgba(255,215,0,0.3)';
                dayElement.style.borderColor = '#ffd700';
                dayElement.style.transform = 'scale(1.05)';
            } else {
                selectedCalendarDays.splice(index, 1);
                dayElement.style.background = 'rgba(255,255,255,0.08)';
                dayElement.style.borderColor = 'rgba(255,255,255,0.1)';
                dayElement.style.transform = 'scale(1)';
            }
            
            updateScheduleButton();
        }

        function selectCalendarRange(range) {
            const today = new Date();
            clearCalendarSelection();
            
            if (range === 'thisWeek') {
                for (let i = 0; i < 7; i++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - today.getDay() + i);
                    if (date >= today) {
                        const dateStr = date.toISOString().split('T')[0];
                        selectedCalendarDays.push(dateStr);
                    }
                }
            } else if (range === 'nextWeek') {
                for (let i = 7; i < 14; i++) {
                    const date = new Date(today);
                    date.setDate(today.getDate() - today.getDay() + i);
                    const dateStr = date.toISOString().split('T')[0];
                    selectedCalendarDays.push(dateStr);
                }
            } else if (range === 'weekends') {
                for (let week = 0; week < 4; week++) {
                    // Saturday
                    const saturday = new Date(today);
                    saturday.setDate(today.getDate() - today.getDay() + 6 + (week * 7));
                    if (saturday >= today) {
                        selectedCalendarDays.push(saturday.toISOString().split('T')[0]);
                    }
                    
                    // Sunday
                    const sunday = new Date(today);
                    sunday.setDate(today.getDate() - today.getDay() + 7 + (week * 7));
                    if (sunday >= today) {
                        selectedCalendarDays.push(sunday.toISOString().split('T')[0]);
                    }
                }
            }
            
            updateCalendarSelection();
            updateScheduleButton();
        }

        function clearCalendarSelection() {
            selectedCalendarDays = [];
            updateCalendarSelection();
            updateScheduleButton();
        }

        function updateCalendarSelection() {
            document.querySelectorAll('.calendar-day').forEach(dayElement => {
                const date = dayElement.dataset.date;
                if (selectedCalendarDays.includes(date)) {
                    dayElement.style.background = 'rgba(255,215,0,0.3)';
                    dayElement.style.borderColor = '#ffd700';
                    dayElement.style.transform = 'scale(1.05)';
                } else {
                    dayElement.style.background = 'rgba(255,255,255,0.08)';
                    dayElement.style.borderColor = 'rgba(255,255,255,0.1)';
                    dayElement.style.transform = 'scale(1)';
                }
            });
        }

        function updateScheduleButton() {
            const addShiftBtn = document.getElementById('addShiftBtn');
            if (addShiftBtn) {
                if (selectedCalendarDays.length > 0 && selectedEmployee && selectedShiftTemplate) {
                    addShiftBtn.style.background = 'linear-gradient(135deg, #00ff88, #00cc66)';
                    addShiftBtn.textContent = `Add to ${selectedCalendarDays.length} Day${selectedCalendarDays.length > 1 ? 's' : ''}`;
                } else {
                    addShiftBtn.style.background = 'linear-gradient(135deg, #00ffff, #0066ff)';
                    addShiftBtn.textContent = 'Add Shift';
                }
            }
        }
        }

        function updateCalendarSelection() {
            document.querySelectorAll('.calendar-day').forEach(day => {
                const date = day.dataset.date;
                if (selectedCalendarDays.includes(date)) {
                    day.style.background = 'rgba(255,215,0,0.3)';
                    day.style.borderColor = '#ffd700';
                    day.style.transform = 'scale(1.05)';
                } else {
                    const isToday = new Date(date).toDateString() === new Date().toDateString();
                    day.style.background = isToday ? 'rgba(0,255,255,0.1)' : 'rgba(255,255,255,0.08)';
                    day.style.borderColor = isToday ? '#00ffff' : 'rgba(255,255,255,0.1)';
                    day.style.transform = 'scale(1)';
                }
            });
        }

        function updateScheduleButton() {
            const btn = document.getElementById('scheduleEmployeeBtn');
            if (selectedCalendarDays.length > 0 && selectedShiftTemplate) {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.textContent = `Schedule ${selectedCalendarDays.length} Day${selectedCalendarDays.length > 1 ? 's' : ''}`;
            } else {
                btn.disabled = true;
                btn.style.opacity = '0.5';
                btn.textContent = 'Select Days & Shift Template';
            }
        }

        function scheduleSelectedEmployee() {
            if (!selectedEmployee || selectedCalendarDays.length === 0 || !selectedShiftTemplate) {
                showNotification('Please select employee, days, and shift template', 'error');
                return;
            }

            const employeeName = selectedEmployee.name;
            const shiftName = selectedShiftTemplate.name;
            const dayCount = selectedCalendarDays.length;
            
            // Simulate scheduling (in real app, this would save to database)
            showNotification(`Successfully scheduled ${employeeName} for ${dayCount} day${dayCount > 1 ? 's' : ''} on ${shiftName}`, 'success');
            
            // Update employee status
            selectedEmployee.status = 'Scheduled';
            generateEmployeeCards();
            
            // Update stats
            const scheduledToday = document.getElementById('scheduledToday');
            scheduledToday.textContent = parseInt(scheduledToday.textContent) + 1;
            
            const weeklyHours = document.getElementById('weeklyHours');
            const hoursPerShift = calculateShiftHours(selectedShiftTemplate.start, selectedShiftTemplate.end);
            weeklyHours.textContent = parseInt(weeklyHours.textContent) + (dayCount * hoursPerShift);
            
            // Reset selections
            closeEmployeeScheduling();
        }

        function calculateShiftHours(startTime, endTime) {
            const start = new Date(`2000-01-01T${startTime}:00`);
            const end = new Date(`2000-01-01T${endTime}:00`);
            if (end < start) end.setDate(end.getDate() + 1); // Handle overnight shifts
            return (end - start) / (1000 * 60 * 60); // Convert to hours
        }

        function filterEmployees() {
            const search = document.getElementById('employeeSearch').value.toLowerCase();
            const roleFilter = document.getElementById('roleFilter').value;
            const statusFilter = document.getElementById('availabilityFilter').value;
            
            document.querySelectorAll('.employee-card').forEach(card => {
                const employeeId = parseInt(card.dataset.employeeId);
                const employee = employees.find(emp => emp.id === employeeId);
                
                const matchesSearch = employee.name.toLowerCase().includes(search);
                const matchesRole = !roleFilter || employee.role === roleFilter;
                const matchesStatus = !statusFilter || employee.status === statusFilter;
                
                if (matchesSearch && matchesRole && matchesStatus) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        function viewEmployeeDetails(employeeId) {
            const employee = employees.find(emp => emp.id === employeeId);
            showNotification(`Viewing details for ${employee.name}`, 'success');
            // In a real app, this would open a detailed modal
        }

        function viewEmployeeStats() {
            if (!selectedEmployee) return;
            showNotification(`Viewing stats for ${selectedEmployee.name}`, 'success');
            // In a real app, this would show detailed analytics
        }

        // Comprehensive Scheduling Calendar Functions
        let currentSchedulingWeek = new Date();
        let existingShifts = {
            // Sample existing shifts data for demonstration
            'monday': [
                { employee: 'Sarah Johnson', role: 'Manager', start: '06:00', end: '14:00', color: '#ff6b9d' },
                { employee: 'Morgan Casey', role: 'Cashier', start: '14:00', end: '22:00', color: '#10b981' }
            ],
            'tuesday': [
                { employee: 'Riley Thompson', role: 'Cashier', start: '09:00', end: '17:00', color: '#10b981' },
                { employee: 'Alex Rivera', role: 'Cashier', start: '17:00', end: '23:00', color: '#10b981' }
            ],
            'wednesday': [
                { employee: 'Jordan Kim', role: 'Cashier', start: '06:00', end: '14:00', color: '#10b981' },
                { employee: 'Sarah Johnson', role: 'Manager', start: '12:00', end: '20:00', color: '#ff6b9d' }
            ],
            'thursday': [
                { employee: 'Casey Morgan', role: 'Cashier', start: '08:00', end: '16:00', color: '#ffd700' },
                { employee: 'Morgan Casey', role: 'Cashier', start: '16:00', end: '24:00', color: '#10b981' }
            ],
            'friday': [
                { employee: 'Riley Thompson', role: 'Cashier', start: '10:00', end: '18:00', color: '#10b981' },
                { employee: 'Alex Rivera', role: 'Cashier', start: '18:00', end: '02:00', color: '#10b981' }
            ],
            'saturday': [
                { employee: 'Jordan Kim', role: 'Cashier', start: '09:00', end: '17:00', color: '#10b981' },
                { employee: 'Sarah Johnson', role: 'Manager', start: '15:00', end: '23:00', color: '#ff6b9d' }
            ],
            'sunday': [
                { employee: 'Casey Morgan', role: 'Cashier', start: '11:00', end: '19:00', color: '#ffd700' }
            ]
        };

        function generateFullScheduleCalendar() {
            const container = document.getElementById('scheduleTimeSlots');
            container.innerHTML = '';
            
            // Generate time slots from 6 AM to 11 PM (17 hours)
            const timeSlots = [];
            for (let hour = 6; hour <= 23; hour++) {
                timeSlots.push(formatHour(hour));
            }
            
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            
            timeSlots.forEach(time => {
                // Time label
                const timeLabel = document.createElement('div');
                timeLabel.style.cssText = `
                    color: #94a3b8;
                    font-size: 11px;
                    text-align: center;
                    padding: 6px 4px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                `;
                timeLabel.textContent = time;
                container.appendChild(timeLabel);
                
                // Day slots
                days.forEach(day => {
                    const slot = document.createElement('div');
                    slot.className = 'schedule-slot';
                    slot.dataset.day = day;
                    slot.dataset.time = time;
                    slot.style.cssText = `
                        border: 1px solid rgba(255,255,255,0.1);
                        border-radius: 4px;
                        min-height: 35px;
                        position: relative;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    `;
                    
                    // Check for existing shifts
                    const dayShifts = existingShifts[day] || [];
                    const currentHour = parseInt(time.split(':')[0]) || parseInt(time.split('M')[0]);
                    const shift = dayShifts.find(s => {
                        const startHour = parseInt(s.start.split(':')[0]);
                        const endHour = parseInt(s.end.split(':')[0]);
                        return currentHour >= startHour && currentHour < endHour;
                    });
                    
                    if (shift) {
                        slot.style.background = `linear-gradient(135deg, ${shift.color}20, ${shift.color}40)`;
                        slot.style.border = `1px solid ${shift.color}`;
                        slot.innerHTML = `
                            <div style="font-size: 9px; color: ${shift.color}; font-weight: bold; padding: 2px;">${shift.employee.split(' ')[0]}</div>
                            <div style="font-size: 8px; color: #94a3b8; padding: 0 2px;">${shift.role}</div>
                        `;
                    }
                    
                    slot.addEventListener('click', () => selectScheduleSlot(day, time, shift));
                    slot.addEventListener('mouseenter', () => {
                        if (!shift) {
                            slot.style.background = 'rgba(0,255,255,0.1)';
                            slot.style.border = '1px solid rgba(0,255,255,0.5)';
                        }
                    });
                    slot.addEventListener('mouseleave', () => {
                        if (!shift) {
                            slot.style.background = 'transparent';
                            slot.style.border = '1px solid rgba(255,255,255,0.1)';
                        }
                    });
                    
                    container.appendChild(slot);
                });
            });
        }

        function generateCoverageAnalysis() {
            const container = document.getElementById('coverageChart');
            container.innerHTML = '';
            
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            
            days.forEach((day, index) => {
                const dayKey = dayKeys[index];
                const shifts = existingShifts[dayKey] || [];
                const coverage = calculateDayCoverage(shifts);
                
                const coverageCard = document.createElement('div');
                coverageCard.style.cssText = `
                    background: rgba(0,0,0,0.3);
                    border-radius: 8px;
                    padding: 12px;
                    text-align: center;
                `;
                
                const coverageLevel = coverage.total > 24 ? 'high' : coverage.total > 16 ? 'medium' : 'low';
                const coverageColor = coverageLevel === 'high' ? '#00ff88' : coverageLevel === 'medium' ? '#ffd700' : '#ff6b9d';
                
                coverageCard.innerHTML = `
                    <div style="color: #94a3b8; font-size: 12px; margin-bottom: 4px;">${day}</div>
                    <div style="color: ${coverageColor}; font-size: 18px; font-weight: bold;">${coverage.total}h</div>
                    <div style="color: #94a3b8; font-size: 10px;">${shifts.length} shifts</div>
                    <div style="margin-top: 4px; font-size: 9px; color: ${coverageColor};">${coverageLevel.toUpperCase()}</div>
                `;
                
                container.appendChild(coverageCard);
            });
        }

        function calculateDayCoverage(shifts) {
            let totalHours = 0;
            shifts.forEach(shift => {
                const start = parseInt(shift.start.split(':')[0]);
                const end = parseInt(shift.end.split(':')[0]);
                const hours = end > start ? end - start : (24 - start) + end;
                totalHours += hours;
            });
            return { total: totalHours, shifts: shifts.length };
        }

        function formatHour(hour) {
            if (hour === 0) return '12AM';
            if (hour < 12) return `${hour}AM`;
            if (hour === 12) return '12PM';
            return `${hour - 12}PM`;
        }

        function selectScheduleSlot(day, time, existingShift) {
            if (existingShift) {
                showShiftManagementOptions(day, time, existingShift);
            } else {
                if (selectedShiftTemplate && selectedEmployee) {
                    addShiftToSlot(day, time);
                } else {
                    showNotification('Select an employee and shift template first', 'warning');
                }
            }
        }

        function showShiftManagementOptions(day, time, shift) {
            const options = [
                `Edit ${shift.employee}'s shift`,
                `Replace ${shift.employee}`,
                `Swap with another shift`,
                `Remove this shift`
            ];
            
            showNotification(`Managing ${shift.employee}'s ${shift.role} shift on ${day.toUpperCase()}`, 'success');
        }

        function addShiftToSlot(day, time) {
            if (!selectedEmployee || !selectedShiftTemplate) return;
            
            const newShift = {
                employee: selectedEmployee.name,
                role: selectedEmployee.role,
                start: selectedShiftTemplate.start,
                end: selectedShiftTemplate.end,
                color: selectedEmployee.color
            };
            
            if (!existingShifts[day]) existingShifts[day] = [];
            existingShifts[day].push(newShift);
            
            showNotification(`Added ${selectedEmployee.name} to ${day.toUpperCase()} ${selectedShiftTemplate.name}`, 'success');
            generateFullScheduleCalendar();
            generateCoverageAnalysis();
        }

        function switchSchedulingView(view) {
            const shiftsBtn = document.getElementById('shiftsViewBtn');
            const coverageBtn = document.getElementById('coverageViewBtn');
            const shiftsView = document.getElementById('fullScheduleCalendar');
            const coverageView = document.getElementById('coverageAnalysis');
            
            if (view === 'shifts') {
                shiftsBtn.style.background = 'rgba(0,255,255,0.2)';
                shiftsBtn.style.borderColor = 'rgba(0,255,255,0.5)';
                shiftsBtn.style.color = '#00ffff';
                coverageBtn.style.background = 'rgba(255,255,255,0.1)';
                coverageBtn.style.borderColor = 'rgba(255,255,255,0.3)';
                coverageBtn.style.color = 'white';
                shiftsView.style.display = 'block';
                coverageView.style.display = 'none';
            } else {
                coverageBtn.style.background = 'rgba(255,215,0,0.2)';
                coverageBtn.style.borderColor = 'rgba(255,215,0,0.5)';
                coverageBtn.style.color = '#ffd700';
                shiftsBtn.style.background = 'rgba(255,255,255,0.1)';
                shiftsBtn.style.borderColor = 'rgba(255,255,255,0.3)';
                shiftsBtn.style.color = 'white';
                shiftsView.style.display = 'none';
                coverageView.style.display = 'block';
            }
        }

        function navigateSchedulingWeek(direction) {
            currentSchedulingWeek.setDate(currentSchedulingWeek.getDate() + (direction * 7));
            updateSchedulingWeekDisplay();
            generateFullScheduleCalendar();
        }

        function updateSchedulingWeekDisplay() {
            const start = new Date(currentSchedulingWeek);
            start.setDate(currentSchedulingWeek.getDate() - currentSchedulingWeek.getDay() + 1);
            const end = new Date(start);
            end.setDate(start.getDate() + 6);
            
            const formatDate = (date) => {
                return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
            };
            
            document.getElementById('schedulingWeekRange').textContent = 
                `${formatDate(start)} - ${formatDate(end)}, ${start.getFullYear()}`;
        }

        function addShiftToCalendar() {
            if (!selectedEmployee) {
                showNotification('Please select an employee first', 'warning');
                return;
            }
            if (!selectedShiftTemplate) {
                showNotification('Please select a shift template first', 'warning');
                return;
            }
            if (selectedCalendarDays.length === 0) {
                showNotification('Please select days on the calendar first', 'warning');
                return;
            }
            
            // Add shifts to selected days
            selectedCalendarDays.forEach(dateStr => {
                const date = new Date(dateStr);
                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const dayName = dayNames[date.getDay()];
                
                if (!existingShifts[dayName]) existingShifts[dayName] = [];
                
                const newShift = {
                    employee: selectedEmployee.name,
                    role: selectedEmployee.role,
                    start: selectedShiftTemplate.start,
                    end: selectedShiftTemplate.end,
                    color: selectedEmployee.color
                };
                
                existingShifts[dayName].push(newShift);
            });
            
            // Reset selections
            selectedCalendarDays = [];
            generateFullScheduleCalendar();
            generateCoverageAnalysis();
            
            showNotification(`Added ${selectedShiftTemplate.name} shifts for ${selectedEmployee.name}`, 'success');
        }

        function replaceShift() {
            showNotification('Click on an existing shift to replace it with the selected employee', 'info');
        }

        function swapShifts() {
            showNotification('Shift swapping feature - click two shifts to swap employees', 'info');
        }

        function showCreateShiftTemplates() {
            document.getElementById('shiftTemplateModal').style.display = 'block';
        }

        function closeShiftTemplateModal() {
            document.getElementById('shiftTemplateModal').style.display = 'none';
            // Reset form
            document.getElementById('templateName').value = '';
            document.getElementById('templateStartTime').value = '';
            document.getElementById('templateEndTime').value = '';
            document.getElementById('templateDescription').value = '';
            document.getElementById('selectedTemplateColor').value = '#ffd700';
            
            // Reset color selection
            document.querySelectorAll('.color-option').forEach(btn => {
                btn.style.borderColor = 'rgba(255,255,255,0.2)';
                btn.style.transform = 'scale(1)';
            });
        }

        function selectTemplateColor(color) {
            document.getElementById('selectedTemplateColor').value = color;
            
            // Update visual selection
            document.querySelectorAll('.color-option').forEach(btn => {
                if (btn.dataset.color === color) {
                    btn.style.borderColor = '#ffffff';
                    btn.style.transform = 'scale(1.1)';
                } else {
                    btn.style.borderColor = 'rgba(255,255,255,0.2)';
                    btn.style.transform = 'scale(1)';
                }
            });
        }

        function createShiftTemplate(event) {
            event.preventDefault();
            
            const name = document.getElementById('templateName').value;
            const startTime = document.getElementById('templateStartTime').value;
            const endTime = document.getElementById('templateEndTime').value;
            const color = document.getElementById('selectedTemplateColor').value;
            const description = document.getElementById('templateDescription').value;
            
            // Create new shift template button
            const templatesContainer = document.getElementById('shiftTemplates');
            const newTemplate = document.createElement('button');
            newTemplate.className = 'shift-template';
            newTemplate.dataset.start = startTime;
            newTemplate.dataset.end = endTime;
            newTemplate.onclick = () => selectShiftTemplate(newTemplate);
            
            const startFormatted = formatTime(startTime);
            const endFormatted = formatTime(endTime);
            
            newTemplate.style.cssText = `
                background: rgba(${hexToRgb(color)}, 0.2);
                border: 1px solid rgba(${hexToRgb(color)}, 0.5);
                color: ${color};
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 12px;
            `;
            
            newTemplate.innerHTML = `${name}<br><small>${startFormatted} - ${endFormatted}</small>`;
            
            // Insert before the "Custom Times" button
            const customButton = templatesContainer.lastElementChild;
            templatesContainer.insertBefore(newTemplate, customButton);
            
            closeShiftTemplateModal();
            showNotification(`Created new shift template: ${name}`, 'success');
        }

        function formatTime(time24) {
            const [hours, minutes] = time24.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const hour12 = hour % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
        }

        function hexToRgb(hex) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `${r}, ${g}, ${b}`;
        }

        function showAddEmployeeModal() {
            showNotification('Opening employee creation form', 'success');
            // In a real app, this would open a modal to add new employees
        }

        function showCustomTimeModal() {
            showNotification('Opening custom time selector', 'success');
            // In a real app, this would open a modal for custom time selection
        }

        // Remove duplicate function - using the primary generateSmartEmployeeCards function above

        function openEmployeeScheduling(employee) {
            // Set the global selectedEmployee variable
            selectedEmployee = employee;
            
            // Set employee details in the scheduling interface
            document.getElementById('selectedEmployeeName').textContent = employee.name;
            document.getElementById('selectedEmployeeRole').textContent = employee.role;
            
            // Show the scheduling interface
            document.getElementById('selectedEmployeeScheduling').style.display = 'block';
            
            // Initialize the scheduling calendar
            generateFullScheduleCalendar();
            generateCoverageAnalysis();
            
            // Update schedule button
            updateScheduleButton();
            
            // Scroll to the scheduling interface
            document.getElementById('selectedEmployeeScheduling').scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });

            showNotification(`Selected ${employee.name} for scheduling`, 'success');
        }

        function closeEmployeeScheduling() {
            document.getElementById('selectedEmployeeScheduling').style.display = 'none';
            showNotification('Closed employee scheduling interface', 'success');
        }

        // One-Click Status Update Functions
        function toggleStatusDropdown(employeeId) {
            // Close all other dropdowns first
            document.querySelectorAll('.status-dropdown').forEach(dropdown => {
                if (dropdown.id !== `status-dropdown-${employeeId}`) {
                    dropdown.classList.remove('show');
                }
            });

            // Toggle the clicked dropdown
            const dropdown = document.getElementById(`status-dropdown-${employeeId}`);
            if (dropdown) {
                dropdown.classList.toggle('show');
            }

            // Close dropdown when clicking outside
            setTimeout(() => {
                document.addEventListener('click', function closeDropdown(e) {
                    if (!e.target.closest('.status-widget')) {
                        document.querySelectorAll('.status-dropdown').forEach(dropdown => {
                            dropdown.classList.remove('show');
                        });
                        document.removeEventListener('click', closeDropdown);
                    }
                });
            }, 100);
        }

        function updateEmployeeStatus(employeeId, newStatus) {
            const statusButton = document.getElementById(`status-btn-${employeeId}`);
            const dropdown = document.getElementById(`status-dropdown-${employeeId}`);
            
            if (statusButton && dropdown) {
                // Update button text and styling
                statusButton.textContent = newStatus;
                statusButton.className = `status-button ${newStatus.toLowerCase()}`;
                
                // Close dropdown
                dropdown.classList.remove('show');
                
                // Update employee data
                const employees = [
                    { id: 'sarah', name: 'Sarah Johnson', role: 'Manager', status: 'Available', avatar: 'S', color: 'manager' },
                    { id: 'mike', name: 'Mike Chen', role: 'Cashier', status: 'Available', avatar: 'M', color: 'cashier' },
                    { id: 'jessica', name: 'Jessica Martinez', role: 'Sales', status: 'Scheduled', avatar: 'J', color: 'sales' },
                    { id: 'david', name: 'David Wilson', role: 'Stock', status: 'Available', avatar: 'D', color: 'stock' },
                    { id: 'emma', name: 'Emma Davis', role: 'Assistant', status: 'Off', avatar: 'E', color: 'assistant' },
                    { id: 'carlos', name: 'Carlos Rodriguez', role: 'Security', status: 'Available', avatar: 'C', color: 'security' }
                ];
                
                const employee = employees.find(emp => emp.id === employeeId);
                if (employee) {
                    employee.status = newStatus;
                    
                    // Show success notification with employee name
                    showNotification(`Updated ${employee.name} status to ${newStatus}`, 'success');
                    
                    // Update schedule view if visible
                    updateScheduleView();
                    
                    // Update statistics
                    updateEmployeeStats();
                }
            }
        }

        function updateScheduleView() {
            // Update any schedule displays that show employee status
            console.log('Schedule view updated with new employee status');
        }

        function updateEmployeeStats() {
            // Update employee statistics counters
            const employees = document.querySelectorAll('.status-button');
            let availableCount = 0;
            let scheduledCount = 0;
            let offCount = 0;
            let breakCount = 0;
            
            employees.forEach(button => {
                const status = button.textContent.toLowerCase();
                switch(status) {
                    case 'available': availableCount++; break;
                    case 'scheduled': scheduledCount++; break;
                    case 'off': offCount++; break;
                    case 'break': breakCount++; break;
                }
            });
            
            console.log(`Employee Status Stats: Available: ${availableCount}, Scheduled: ${scheduledCount}, Off: ${offCount}, Break: ${breakCount}`);
        }

        // Smooth Tab Switching Function - Simple and Effective
        function showTab(tabId) {
            // Remove active class from all nav chips
            document.querySelectorAll('.nav-chip').forEach(chip => {
                chip.classList.remove('active');
            });

            // Add active class to clicked nav chip
            const activeChip = document.querySelector(`[data-tab="${tabId}"]`);
            if (activeChip) {
                activeChip.classList.add('active');
            }

            // Hide all tabs immediately
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
                content.classList.remove('active');
            });

            // Show the selected tab
            const targetTab = document.getElementById(tabId);
            if (targetTab) {
                targetTab.style.display = 'block';
                targetTab.classList.add('active');
            }

            // Initialize tab-specific functionality
            if (tabId === 'employees') {
                initializeSmartEmployeeManagement();
            } else if (tabId === 'volunteers') {
                console.log('Volunteer Management positioned at top of Volunteers tab');
            } else if (tabId === 'qr-system') {
                console.log('Employee QR System positioned at top of QR System tab');
            }
        }

        // Initialize smart employee management when the tab is loaded
        document.addEventListener('DOMContentLoaded', function() {
            // Initialize the first tab
            showTab('schedule');
            
            // Small delay to ensure DOM is fully loaded
            setTimeout(initializeSmartEmployeeManagement, 100);
        });

        // Employee Management Functions
        function submitEmployeeForm(event) {
            event.preventDefault();
            
            const name = document.getElementById('employeeName').value;
            const role = document.getElementById('employeeRole').value;
            const rate = document.getElementById('employeeRate').value;
            
            // Add employee to the list
            const employeeList = document.getElementById('employeeList');
            const newEmployee = document.createElement('div');
            newEmployee.className = 'employee-item';
            newEmployee.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;';
            
            newEmployee.innerHTML = `
                <div>
                    <div style="font-weight: bold; color: white;">${name}</div>
                    <div style="color: #94a3b8; font-size: 14px;">${role} - $${parseFloat(rate).toFixed(2)}/hr</div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn" style="padding: 6px 12px; font-size: 12px;" onclick="editEmployee('${name}')">Edit</button>
                    <button class="btn" style="padding: 6px 12px; font-size: 12px; background: rgba(255,0,0,0.2);" onclick="removeEmployee('${name}')">Remove</button>
                </div>
            `;
            
            employeeList.appendChild(newEmployee);
            
            // Update stats
            const totalEmployees = document.getElementById('totalEmployees');
            totalEmployees.textContent = parseInt(totalEmployees.textContent) + 1;
            
            // Clear form
            document.getElementById('employeeName').value = '';
            document.getElementById('employeeRate').value = '';
            
            showNotification(`Added ${name} as ${role}`, 'success');
        }

        function editEmployee(name) {
            showNotification(`Opening edit form for ${name}`, 'success');
        }

        function removeEmployee(name) {
            const employeeItems = document.querySelectorAll('.employee-item');
            employeeItems.forEach(item => {
                if (item.textContent.includes(name)) {
                    item.remove();
                    
                    // Update stats
                    const totalEmployees = document.getElementById('totalEmployees');
                    totalEmployees.textContent = parseInt(totalEmployees.textContent) - 1;
                    
                    showNotification(`Removed ${name} from employee list`, 'success');
                }
            });
        }

        // Volunteer Management Functions
        function submitVolunteerForm(event) {
            event.preventDefault();
            
            const name = document.getElementById('volunteerName').value;
            const skills = document.getElementById('volunteerSkills').value;
            const availability = document.getElementById('volunteerAvailability').value;
            
            // Add volunteer to the list
            const volunteerList = document.getElementById('volunteerList');
            const newVolunteer = document.createElement('div');
            newVolunteer.className = 'volunteer-item';
            newVolunteer.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px;';
            
            newVolunteer.innerHTML = `
                <div>
                    <div style="font-weight: bold; color: white;">${name}</div>
                    <div style="color: #94a3b8; font-size: 14px;">${skills} • ${availability}</div>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button class="btn" style="padding: 6px 12px; font-size: 12px;" onclick="editVolunteer('${name}')">Edit</button>
                    <button class="btn" style="padding: 6px 12px; font-size: 12px; background: rgba(255,0,0,0.2);" onclick="removeVolunteer('${name}')">Remove</button>
                </div>
            `;
            
            volunteerList.appendChild(newVolunteer);
            
            // Update stats
            const totalVolunteers = document.getElementById('totalVolunteers');
            totalVolunteers.textContent = parseInt(totalVolunteers.textContent) + 1;
            
            // Clear form
            document.getElementById('volunteerName').value = '';
            
            showNotification(`Added ${name} as volunteer for ${skills}`, 'success');
        }

        function editVolunteer(name) {
            showNotification(`Opening edit form for ${name}`, 'success');
        }

        function removeVolunteer(name) {
            const volunteerItems = document.querySelectorAll('.volunteer-item');
            volunteerItems.forEach(item => {
                if (item.textContent.includes(name)) {
                    item.remove();
                    
                    // Update stats
                    const totalVolunteers = document.getElementById('totalVolunteers');
                    totalVolunteers.textContent = parseInt(totalVolunteers.textContent) - 1;
                    
                    showNotification(`Removed ${name} from volunteer list`, 'success');
                }
            });
        }

        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 16px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 1001;
                animation: slideIn 0.3s ease;
                background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'};
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }

        // Voice Recognition System
        let recognition = null;
        let isListening = false;

        function initializeVoiceRecognition() {
            if ('webkitSpeechRecognition' in window) {
                recognition = new webkitSpeechRecognition();
            } else if ('SpeechRecognition' in window) {
                recognition = new SpeechRecognition();
            } else {
                console.warn('Speech recognition not supported');
                document.getElementById('start-voice').disabled = true;
                document.getElementById('voice-status').textContent = 'Voice recognition not supported';
                return false;
            }

            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = function() {
                isListening = true;
                document.getElementById('voice-status').textContent = 'Listening...';
                document.getElementById('start-voice').style.display = 'none';
                document.getElementById('stop-voice').style.display = 'flex';
                
                // Add pulsing animation to voice icon
                document.querySelector('.voice-icon').style.animation = 'pulse 1.5s ease-in-out infinite';
            };

            recognition.onresult = function(event) {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        transcript += event.results[i][0].transcript;
                    }
                }
                
                if (transcript.trim()) {
                    processVoiceCommand(transcript.trim());
                }
            };

            recognition.onerror = function(event) {
                console.error('Voice recognition error:', event.error);
                document.getElementById('voice-status').textContent = 'Error: ' + event.error;
                stopVoiceRecognition();
            };

            recognition.onend = function() {
                stopVoiceRecognition();
            };

            return true;
        }



        function stopVoiceRecognition() {
            if (recognition && isListening) {
                recognition.stop();
            }
            
            isListening = false;
            document.getElementById('voice-status').textContent = 'Ready to listen';
            document.getElementById('start-voice').style.display = 'flex';
            document.getElementById('stop-voice').style.display = 'none';
            
            // Remove pulsing animation
            document.querySelector('.voice-icon').style.animation = 'none';
        }

        function processVoiceCommand(command) {
            updateVoiceOutput(`🔊 Command received: "${command}"`);
            
            const cmd = command.toLowerCase();
            
            // Employee mapping
            const employees = {
                'sarah': { name: 'Sarah Johnson', role: 'manager' },
                'mike': { name: 'Mike Chen', role: 'cashier' },
                'jessica': { name: 'Jessica Martinez', role: 'sales' },
                'david': { name: 'David Wilson', role: 'stock' },
                'emma': { name: 'Emma Davis', role: 'assistant' },
                'carlos': { name: 'Carlos Rodriguez', role: 'security' }
            };

            // Day mapping
            const days = {
                'monday': 'mon', 'tuesday': 'tue', 'wednesday': 'wed', 
                'thursday': 'thu', 'friday': 'fri', 'saturday': 'sat', 'sunday': 'sun'
            };

            // Schedule employee commands
            if (cmd.includes('schedule') || cmd.includes('add')) {
                let employeeName = null;
                let day = null;
                let startTime = null;
                let endTime = null;

                // Find employee
                for (const [key, employee] of Object.entries(employees)) {
                    if (cmd.includes(key)) {
                        employeeName = key;
                        break;
                    }
                }

                // Find day
                for (const [dayName, dayShort] of Object.entries(days)) {
                    if (cmd.includes(dayName)) {
                        day = dayShort;
                        break;
                    }
                }

                // Extract time patterns
                const timeRegex = /(\d{1,2})\s*(am|pm|AM|PM)/g;
                const times = [...cmd.matchAll(timeRegex)];
                
                if (times.length >= 2) {
                    startTime = times[0][0];
                    endTime = times[1][0];
                } else if (cmd.includes('morning')) {
                    startTime = '9AM';
                    endTime = '12PM';
                } else if (cmd.includes('afternoon')) {
                    startTime = '1PM';
                    endTime = '5PM';
                } else if (cmd.includes('evening')) {
                    startTime = '6PM';
                    endTime = '10PM';
                }

                if (employeeName && day) {
                    const employee = employees[employeeName];
                    const timeInfo = startTime && endTime ? ` from ${startTime} to ${endTime}` : '';
                    updateVoiceOutput(`✅ Scheduling ${employee.name} on ${day.toUpperCase()}${timeInfo}`);
                    addEmployeeToSchedule(employeeName, day, startTime, endTime);
                    showNotification(`Scheduled ${employee.name} for ${day.toUpperCase()}${timeInfo}`, 'success');
                } else {
                    updateVoiceOutput('❌ Could not understand the scheduling command. Please specify employee and day.');
                }
            }
            // Remove employee commands
            else if (cmd.includes('remove') || cmd.includes('delete')) {
                let employeeName = null;
                let day = null;

                for (const [key, employee] of Object.entries(employees)) {
                    if (cmd.includes(key)) {
                        employeeName = key;
                        break;
                    }
                }

                for (const [dayName, dayShort] of Object.entries(days)) {
                    if (cmd.includes(dayName)) {
                        day = dayShort;
                        break;
                    }
                }

                if (employeeName && day) {
                    const employee = employees[employeeName];
                    updateVoiceOutput(`✅ Removing ${employee.name} from ${day.toUpperCase()}`);
                    removeEmployeeFromSchedule(employeeName, day);
                    showNotification(`Removed ${employee.name} from ${day.toUpperCase()}`, 'success');
                } else {
                    updateVoiceOutput('❌ Could not understand the removal command. Please specify employee and day.');
                }
            }
            // Show availability commands
            else if (cmd.includes('availability') || cmd.includes('show') || cmd.includes('who')) {
                updateVoiceOutput('📋 Current employee roster: Sarah (Manager), Mike (Cashier), Jessica (Sales), David (Stock), Emma (Assistant), Carlos (Security)');
                showNotification('Employee availability displayed', 'success');
            }
            // Help commands
            else if (cmd.includes('help') || cmd.includes('what can')) {
                updateVoiceOutput(`🤖 Voice commands available:
• "Schedule [name] on [day] from [start] to [end]"
• "Add [name] to [day] morning/afternoon/evening"
• "Remove [name] from [day]"
• "Show me employee availability"
• "Help" - Show this help`);
            }
            else {
                updateVoiceOutput(`❓ Command not recognized: "${command}". Try saying "help" for available commands.`);
            }
        }



        function addEmployeeToSchedule(employee, day, startTime, endTime) {
            // This would integrate with the actual scheduling system
            console.log(`Adding ${employee} to ${day} from ${startTime} to ${endTime}`);
        }

        function removeEmployeeFromSchedule(employee, day) {
            // This would integrate with the actual scheduling system
            console.log(`Removing ${employee} from ${day}`);
        }

        // Drag and Drop Functionality
        function initializeDragAndDrop() {
            const employeeChips = document.querySelectorAll('.employee-chip');
            const daySchedules = document.querySelectorAll('.day-schedule');

            employeeChips.forEach(chip => {
                chip.addEventListener('dragstart', function(e) {
                    e.dataTransfer.setData('text/plain', JSON.stringify({
                        employee: this.dataset.employee,
                        role: this.dataset.role,
                        name: this.querySelector('.chip-name').textContent
                    }));
                    this.style.opacity = '0.5';
                });

                chip.addEventListener('dragend', function(e) {
                    this.style.opacity = '1';
                });
            });

            daySchedules.forEach(schedule => {
                schedule.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    this.style.backgroundColor = 'rgba(0, 255, 255, 0.1)';
                });

                schedule.addEventListener('dragleave', function(e) {
                    this.style.backgroundColor = '';
                });

                schedule.addEventListener('drop', function(e) {
                    e.preventDefault();
                    this.style.backgroundColor = '';
                    
                    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                    const dayName = this.closest('.day-column').querySelector('.day-name').textContent;
                    
                    // Calculate drop position to determine time
                    const rect = this.getBoundingClientRect();
                    const y = e.clientY - rect.top;
                    const hourHeight = 65; // Height of each hour slot
                    const startHour = 6; // Start at 6 AM
                    const dropHour = Math.floor(y / hourHeight) + startHour;
                    
                    const startTime = formatTime(dropHour);
                    const endTime = formatTime(dropHour + 4); // Default 4-hour shift
                    
                    showNotification(`Added ${data.name} to ${dayName} from ${startTime} to ${endTime}`, 'success');
                    
                    // Create visual shift block
                    createShiftBlock(this, data, y, startTime, endTime);
                });
            });
        }

        function createShiftBlock(container, employeeData, yPosition, startTime, endTime) {
            const shiftBlock = document.createElement('div');
            shiftBlock.className = `shift-block ${employeeData.role}`;
            shiftBlock.style.cssText = `
                position: absolute;
                top: ${yPosition}px;
                height: 260px; /* 4 hours * 65px */
                left: 4px;
                right: 4px;
                cursor: pointer;
            `;
            
            shiftBlock.innerHTML = `
                <div class="shift-info">${employeeData.name} • ${employeeData.role.charAt(0).toUpperCase() + employeeData.role.slice(1)}</div>
                <div class="shift-time">${startTime}-${endTime}</div>
            `;
            
            shiftBlock.onclick = function() {
                editShift(`${employeeData.employee}-${startTime}-${endTime}`);
            };
            
            container.appendChild(shiftBlock);
        }

        function formatTime(hour) {
            if (hour === 0) return '12AM';
            if (hour < 12) return hour + 'AM';
            if (hour === 12) return '12PM';
            return (hour - 12) + 'PM';
        }

        // CSS for pulse animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.1); opacity: 0.7; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        // Festival Scale Management System
        let currentScale = 'small';
        let employeeDatabase = [];
        let currentPage = 1;
        let employeesPerPage = 20;
        let filteredEmployees = [];

        function generateFestivalEmployees(count) {
            const roles = ['manager', 'cashier', 'sales', 'stock', 'assistant', 'security', 'performer', 'vendor', 'tech', 'cleanup'];
            const names = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Jamie', 'Riley', 'Avery', 'Quinn', 'Cameron'];
            const lastNames = ['Smith', 'Johnson', 'Brown', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson'];
            
            const employees = [];
            for (let i = 0; i < count; i++) {
                const role = roles[Math.floor(Math.random() * roles.length)];
                const firstName = names[Math.floor(Math.random() * names.length)];
                const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                
                employees.push({
                    id: `emp_${i + 1}`,
                    name: `${firstName} ${lastName}`,
                    role: role,
                    department: getDepartmentByRole(role),
                    availability: Math.random() > 0.3 ? 'available' : 'unavailable',
                    scheduled: Math.random() > 0.7,
                    avatar: firstName.charAt(0).toUpperCase()
                });
            }
            return employees;
        }

        function getDepartmentByRole(role) {
            const departments = {
                'manager': 'Operations',
                'cashier': 'Sales',
                'sales': 'Sales',
                'stock': 'Logistics',
                'assistant': 'Operations',
                'security': 'Security',
                'performer': 'Entertainment',
                'vendor': 'Food & Beverage',
                'tech': 'Technical',
                'cleanup': 'Maintenance'
            };
            return departments[role] || 'General';
        }

        function setEventScale(scale) {
            currentScale = scale;
            
            // Update active button
            document.querySelectorAll('.scale-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`[data-scale="${scale}"]`).classList.add('active');
            
            // Generate appropriate employee count
            let employeeCount;
            switch(scale) {
                case 'small':
                    employeeCount = 6;
                    employeesPerPage = 20;
                    break;
                case 'medium':
                    employeeCount = 50;
                    employeesPerPage = 25;
                    break;
                case 'large':
                    employeeCount = 500;
                    employeesPerPage = 20;
                    break;
            }
            
            // Show/hide bulk actions for medium and large scales
            const bulkActions = document.getElementById('bulk-actions');
            if (scale === 'small') {
                bulkActions.style.display = 'none';
            } else {
                bulkActions.style.display = 'block';
            }
            
            // Generate employee database
            if (scale === 'small') {
                employeeDatabase = [
                    { id: 'sarah', name: 'Sarah Johnson', role: 'manager', department: 'Operations', availability: 'available', scheduled: false, avatar: 'S' },
                    { id: 'mike', name: 'Mike Chen', role: 'cashier', department: 'Sales', availability: 'available', scheduled: false, avatar: 'M' },
                    { id: 'jessica', name: 'Jessica Martinez', role: 'sales', department: 'Sales', availability: 'available', scheduled: false, avatar: 'J' },
                    { id: 'david', name: 'David Wilson', role: 'stock', department: 'Logistics', availability: 'available', scheduled: false, avatar: 'D' },
                    { id: 'emma', name: 'Emma Davis', role: 'assistant', department: 'Operations', availability: 'available', scheduled: false, avatar: 'E' },
                    { id: 'carlos', name: 'Carlos Rodriguez', role: 'security', department: 'Security', availability: 'available', scheduled: false, avatar: 'C' }
                ];
            } else {
                employeeDatabase = generateFestivalEmployees(employeeCount);
            }
            
            currentPage = 1;
            filterEmployees();
            
            showNotification(`Switched to ${scale} scale with ${employeeCount} employees`, 'success');
            updateVoiceConsole(`📊 Event scale set to ${scale.toUpperCase()} - Managing ${employeeCount} employees`);
        }

        function updateVoiceOutput(message) {
            updateVoiceConsole(message);
        }

        function filterEmployees() {
            const searchTerm = document.getElementById('employee-search').value.toLowerCase();
            const roleFilter = document.getElementById('role-filter').value;
            const availabilityFilter = document.getElementById('availability-filter').value;
            
            filteredEmployees = employeeDatabase.filter(employee => {
                const matchesSearch = employee.name.toLowerCase().includes(searchTerm) || 
                                    employee.role.toLowerCase().includes(searchTerm);
                const matchesRole = !roleFilter || employee.role === roleFilter;
                const matchesAvailability = !availabilityFilter || 
                    (availabilityFilter === 'available' && employee.availability === 'available') ||
                    (availabilityFilter === 'scheduled' && employee.scheduled) ||
                    (availabilityFilter === 'unavailable' && employee.availability === 'unavailable');
                
                return matchesSearch && matchesRole && matchesAvailability;
            });
            
            updateEmployeeDisplay();
        }

        function updateEmployeeDisplay() {
            const roster = document.getElementById('employee-roster');
            const startIndex = (currentPage - 1) * employeesPerPage;
            const endIndex = startIndex + employeesPerPage;
            const pageEmployees = filteredEmployees.slice(startIndex, endIndex);
            
            // Clear roster
            roster.innerHTML = '';
            
            // Add employees
            pageEmployees.forEach(employee => {
                const chip = createEmployeeChip(employee);
                roster.appendChild(chip);
            });
            
            // Update counts
            document.getElementById('employee-count').textContent = `${employeeDatabase.length} employees`;
            document.getElementById('filtered-count').textContent = `${filteredEmployees.length} visible`;
            
            // Update pagination
            updatePagination();
            
            // Apply compact styling for large scale
            if (currentScale === 'large') {
                roster.querySelectorAll('.employee-chip').forEach(chip => {
                    chip.classList.add('compact');
                });
            }
        }

        function createEmployeeChip(employee) {
            const chip = document.createElement('div');
            chip.className = `employee-chip ${employee.role}`;
            chip.draggable = true;
            chip.dataset.employee = employee.id;
            chip.dataset.role = employee.role;
            
            chip.innerHTML = `
                <div class="chip-avatar">${employee.avatar}</div>
                <div class="chip-name">${employee.name.split(' ')[0]}</div>
                <div class="chip-role">${employee.role}</div>
            `;
            
            // Add availability indicator
            if (employee.availability === 'unavailable') {
                chip.style.opacity = '0.5';
                chip.style.filter = 'grayscale(70%)';
            }
            if (employee.scheduled) {
                chip.style.border = '2px solid #ffd700';
            }
            
            return chip;
        }

        function updatePagination() {
            const pagination = document.getElementById('roster-pagination');
            const pageInfo = document.getElementById('page-info');
            
            const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
            
            if (totalPages <= 1) {
                pagination.style.display = 'none';
            } else {
                pagination.style.display = 'flex';
                pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
                
                const prevBtn = pagination.querySelector('.page-btn');
                const nextBtn = pagination.querySelectorAll('.page-btn')[1];
                
                prevBtn.disabled = currentPage === 1;
                nextBtn.disabled = currentPage === totalPages;
            }
        }

        function previousPage() {
            if (currentPage > 1) {
                currentPage--;
                updateEmployeeDisplay();
            }
        }

        function nextPage() {
            const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                updateEmployeeDisplay();
            }
        }

        // Bulk Scheduling Functions
        function bulkScheduleByRole() {
            const selectedRole = document.getElementById('role-filter').value;
            if (!selectedRole) {
                showNotification('Please select a role filter first', 'error');
                return;
            }
            
            const roleEmployees = employeeDatabase.filter(emp => emp.role === selectedRole);
            showNotification(`Bulk scheduling ${roleEmployees.length} ${selectedRole}s`, 'success');
            updateVoiceOutput(`📋 Bulk scheduling initiated for ${roleEmployees.length} ${selectedRole}s`);
        }

        function bulkScheduleByDepartment() {
            showNotification('Department-based bulk scheduling initiated', 'success');
            updateVoiceOutput('🏢 Scheduling employees by department groups');
        }

        function autoFillShifts() {
            showNotification('Auto-filling shifts based on availability and preferences', 'success');
            updateVoiceOutput('🤖 AI auto-fill algorithm initiated - optimizing coverage');
        }

        function importSchedule() {
            showNotification('Schedule import feature activated', 'success');
            updateVoiceOutput('📥 Ready to import schedule from CSV, Excel, or other scheduling systems');
        }

        // Enhanced Voice Commands for Large Scale
        function processVoiceCommandEnhanced(command) {
            const cmd = command.toLowerCase();
            
            // Bulk scheduling commands
            if (cmd.includes('bulk schedule') || cmd.includes('schedule all')) {
                if (cmd.includes('security')) {
                    document.getElementById('role-filter').value = 'security';
                    filterEmployees();
                    bulkScheduleByRole();
                } else if (cmd.includes('manager')) {
                    document.getElementById('role-filter').value = 'manager';
                    filterEmployees();
                    bulkScheduleByRole();
                } else {
                    autoFillShifts();
                }
                return true;
            }
            
            // Filter commands
            if (cmd.includes('show only') || cmd.includes('filter')) {
                if (cmd.includes('available')) {
                    document.getElementById('availability-filter').value = 'available';
                    filterEmployees();
                    updateVoiceOutput('✅ Showing only available employees');
                } else if (cmd.includes('security')) {
                    document.getElementById('role-filter').value = 'security';
                    filterEmployees();
                    updateVoiceOutput('🛡️ Showing only security staff');
                }
                return true;
            }
            
            // Scale commands
            if (cmd.includes('switch to') || cmd.includes('change scale')) {
                if (cmd.includes('large') || cmd.includes('festival')) {
                    setEventScale('large');
                } else if (cmd.includes('medium')) {
                    setEventScale('medium');
                } else if (cmd.includes('small')) {
                    setEventScale('small');
                }
                return true;
            }
            
            return false;
        }

        // Override the original voice command processor
        const originalProcessVoiceCommand = processVoiceCommand;
        processVoiceCommand = function(command) {
            if (!processVoiceCommandEnhanced(command)) {
                originalProcessVoiceCommand(command);
            }
        };

        // Sleek Voice Control Functions
        function toggleVoiceControl() {
            const dropdown = document.getElementById('voice-commands-dropdown');
            const console = document.getElementById('voice-output-console');
            const pulse = document.getElementById('voice-pulse-effect');
            const btn = document.getElementById('voice-command-btn');
            
            if (dropdown.style.display === 'none' || !dropdown.style.display) {
                // Show dropdown and start voice
                dropdown.style.display = 'block';
                console.style.display = 'block';
                pulse.style.display = 'block';
                btn.textContent = 'LISTENING';
                btn.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
                
                updateVoiceConsole('🎤 Voice assistant activated - speak your command');
                startVoiceRecognition();
            } else {
                // Hide dropdown and stop voice
                hideVoiceDropdown();
                stopVoiceRecognition();
            }
        }

        function hideVoiceDropdown() {
            const dropdown = document.getElementById('voice-commands-dropdown');
            const console = document.getElementById('voice-output-console');
            const pulse = document.getElementById('voice-pulse-effect');
            const btn = document.getElementById('voice-command-btn');
            
            dropdown.style.display = 'none';
            console.style.display = 'none';
            pulse.style.display = 'none';
            btn.textContent = 'COMMAND';
            btn.style.background = 'linear-gradient(135deg, #8a2be2, #4169e1)';
            
            updateVoiceConsole('Voice system ready...');
        }

        function updateVoiceConsole(message) {
            const console = document.getElementById('voice-console-text');
            if (console) {
                const timestamp = new Date().toLocaleTimeString();
                console.innerHTML = `[${timestamp}] ${message}`;
            }
        }

        // Enhanced Voice Recognition for Sleek Interface
        function startVoiceRecognition() {
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                updateVoiceConsole('❌ Speech recognition not supported in this browser');
                return;
            }

            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = function() {
                updateVoiceConsole('🎙️ Listening for voice commands...');
            };

            recognition.onresult = function(event) {
                const transcript = event.results[event.results.length - 1][0].transcript.trim();
                if (event.results[event.results.length - 1].isFinal) {
                    updateVoiceConsole(`📝 Command: "${transcript}"`);
                    processVoiceCommand(transcript);
                } else {
                    updateVoiceConsole(`🔊 Hearing: "${transcript}"`);
                }
            };

            recognition.onerror = function(event) {
                updateVoiceConsole(`❌ Voice error: ${event.error}`);
            };

            recognition.onend = function() {
                updateVoiceConsole('⏹️ Voice recognition stopped');
                hideVoiceDropdown();
            };

            window.currentRecognition = recognition;
            recognition.start();
        }

        function stopVoiceRecognition() {
            if (window.currentRecognition) {
                window.currentRecognition.stop();
            }
            updateVoiceConsole('Voice system ready...');
        }

        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Business Scheduling page loaded successfully');
            initializeVoiceRecognition();
            initializeDragAndDrop();
            initializeSmartEmployeeManagement();
            
            // Initialize with small scale
            setEventScale('small');
            
            showNotification('Festival-scale scheduling system ready', 'success');
            
            // Welcome message
            setTimeout(() => {
                updateVoiceConsole('🚀 Sleek voice assistant ready - click "Command" to begin');
            }, 1000);
        });
    </script>
