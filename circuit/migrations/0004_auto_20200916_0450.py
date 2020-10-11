# Generated by Django 3.1 on 2020-09-16 04:50

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('circuit', '0003_auto_20200916_0207'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='circuit',
            name='description',
        ),
        migrations.RemoveField(
            model_name='circuit',
            name='user',
        ),
        migrations.AddField(
            model_name='circuit',
            name='timestamp',
            field=models.DateTimeField(auto_now_add=True, default=django.utils.timezone.now),
            preserve_default=False,
        ),
        migrations.DeleteModel(
            name='User',
        ),
    ]
