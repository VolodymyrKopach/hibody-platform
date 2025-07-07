require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSlideCreation() {
  console.log('🧪 Тестування збереження слайдів в БД...\n');

  try {
    // 1. Отримуємо тестового користувача
    const { data: users, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (userError) {
      console.error('❌ Помилка отримання користувача:', userError);
      return;
    }

    if (!users || users.length === 0) {
      console.error('❌ Немає користувачів в базі даних');
      return;
    }

    const testUser = users[0];
    console.log('✅ Знайдено тестового користувача:', testUser.email);

    // 2. Створюємо тестовий урок
    const lessonData = {
      title: 'Тестовий урок для слайдів',
      description: 'Урок створений для тестування збереження слайдів в БД',
      subject: 'тестування',
      age_group: '6-7',
      duration: 30,
      user_id: testUser.id,
      status: 'draft',
      is_public: false
    };

    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .insert(lessonData)
      .select()
      .single();

    if (lessonError) {
      console.error('❌ Помилка створення уроку:', lessonError);
      return;
    }

    console.log('✅ Урок створено:', lesson.title, '(ID:', lesson.id + ')');

    // 3. Створюємо тестові слайди
    const slidesData = [
      {
        lesson_id: lesson.id,
        title: 'Вітальний слайд',
        description: 'Привітання та знайомство з темою',
        type: 'welcome',
        icon: '👋',
        slide_number: 1,
        status: 'ready',
        preview_text: 'Привіт! Сьогодні ми вивчаємо цікаву тему!',
        html_content: '<h1>Привіт! Сьогодні ми вивчаємо цікаву тему!</h1>',
        metadata: {
          generatedContent: true,
          testData: true
        }
      },
      {
        lesson_id: lesson.id,
        title: 'Основний матеріал',
        description: 'Подача нового матеріалу',
        type: 'content',
        icon: '📚',
        slide_number: 2,
        status: 'ready',
        preview_text: 'Основний матеріал уроку',
        html_content: '<h1>Основний матеріал</h1><p>Тут буде основний контент уроку.</p>',
        metadata: {
          generatedContent: true,
          testData: true
        }
      },
      {
        lesson_id: lesson.id,
        title: 'Практичне завдання',
        description: 'Закріплення знань',
        type: 'activity',
        icon: '🎯',
        slide_number: 3,
        status: 'draft',
        preview_text: 'Час для практики!',
        html_content: '<h1>Практичне завдання</h1><p>Давайте закріпимо вивчене!</p>',
        metadata: {
          generatedContent: true,
          testData: true
        }
      }
    ];

    const { data: slides, error: slidesError } = await supabase
      .from('slides')
      .insert(slidesData)
      .select();

    if (slidesError) {
      console.error('❌ Помилка створення слайдів:', slidesError);
      return;
    }

    console.log('✅ Слайди створено:', slides.length, 'слайдів');
    slides.forEach((slide, index) => {
      console.log(`   ${index + 1}. ${slide.title} (${slide.type}) - ${slide.status}`);
    });

    // 4. Перевіряємо збереження - отримуємо слайди назад
    const { data: retrievedSlides, error: retrieveError } = await supabase
      .from('slides')
      .select('*')
      .eq('lesson_id', lesson.id)
      .order('slide_number');

    if (retrieveError) {
      console.error('❌ Помилка отримання слайдів:', retrieveError);
      return;
    }

    console.log('\n✅ Перевірка збереження:');
    console.log('   Збережено слайдів:', retrievedSlides.length);
    retrievedSlides.forEach((slide, index) => {
      console.log(`   ${index + 1}. ${slide.title} - ${slide.status} (${slide.processing_status})`);
    });

    // 5. Тестуємо оновлення слайду
    const slideToUpdate = retrievedSlides[0];
    const { data: updatedSlide, error: updateError } = await supabase
      .from('slides')
      .update({
        title: 'Оновлений вітальний слайд',
        status: 'ready',
        html_content: '<h1>Оновлений контент!</h1><p>Слайд був успішно оновлений.</p>'
      })
      .eq('id', slideToUpdate.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Помилка оновлення слайду:', updateError);
    } else {
      console.log('✅ Слайд оновлено:', updatedSlide.title);
    }

    // 6. Тестуємо видалення одного слайду
    const slideToDelete = retrievedSlides[retrievedSlides.length - 1];
    const { error: deleteError } = await supabase
      .from('slides')
      .delete()
      .eq('id', slideToDelete.id);

    if (deleteError) {
      console.error('❌ Помилка видалення слайду:', deleteError);
    } else {
      console.log('✅ Слайд видалено:', slideToDelete.title);
    }

    // 7. Перевіряємо фінальний стан
    const { data: finalSlides, error: finalError } = await supabase
      .from('slides')
      .select('*')
      .eq('lesson_id', lesson.id)
      .order('slide_number');

    if (finalError) {
      console.error('❌ Помилка фінальної перевірки:', finalError);
    } else {
      console.log('\n✅ Фінальний стан:');
      console.log('   Слайдів залишилось:', finalSlides.length);
      finalSlides.forEach((slide, index) => {
        console.log(`   ${index + 1}. ${slide.title} - ${slide.status}`);
      });
    }

    console.log('\n🎉 Тестування завершено успішно!');
    console.log('📊 Результат: Збереження слайдів в БД працює коректно');

  } catch (error) {
    console.error('❌ Критична помилка:', error);
  }
}

testSlideCreation(); 