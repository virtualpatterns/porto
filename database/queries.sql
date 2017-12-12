set @userId = 0; call insertUser(@userId, 'Aa'); select @userId as userId;
set @userId = 0; call insertUser(@userId, 'Bb'); select @userId as userId;
set @userId = 0; call insertUser(@userId, 'Cc'); select @userId as userId;
set @userId = 0; call insertUser(@userId, 'Dd'); select @userId as userId;
set @userId = 0; call insertUser(@userId, 'Ee'); select @userId as userId;

call getAttendance(null, null);

call insertAttendance(1055, 1657, 1, '0.0.0.0', 'User-Agent');

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
select * from insertedAttendance;

call clean();

set @userId = 0; call insertUser(@userId, 'Jeff'); select @userId as userId;
set @userId = 0; call insertUser(@userId, 'Frank'); select @userId as userId;
set @userId = 0; call insertUser(@userId, 'Veronique'); select @userId as userId;
set @userId = 0; call insertUser(@userId, 'Cristina'); select @userId as userId;
set @userId = 0; call insertUser(@userId, 'Elsie'); select @userId as userId;
