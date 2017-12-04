set @userId = 0; call insertUser(@userId, 'Aa'); select @userId as userId;
set @userId = 0; call insertUser(@userId, 'Bb'); select @userId as userId;
set @userId = 0; call insertUser(@userId, 'Cc'); select @userId as userId;
set @userId = 0; call insertUser(@userId, 'Dd'); select @userId as userId;
set @userId = 0; call insertUser(@userId, 'Ee'); select @userId as userId;

call getAttendance(null, null);

call insertAttendance(667, 962, 1);
call insertAttendance(667, 963, 0);
call insertAttendance(667, 964, 1);
call insertAttendance(667, 965, 0);
call insertAttendance(667, 966, 1);

call getAttendance(null, null);

delete from deletedAttendance;
delete from attendance;
delete from meeting;
delete from deletedUser;
delete from user;
delete from batch;

select * from batch;
select * from deletedUser;
select * from user;

call clean();
